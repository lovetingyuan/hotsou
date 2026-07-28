import { DurableObject } from 'cloudflare:workers'
import {
  applyFixedWindowRateLimit,
  OTP_COOLDOWN_MS,
  OTP_EXPIRY_MS,
  type OtpVerificationResult,
  verifyStoredOtp,
} from './authSecurity'
import { createRefreshedTokenState, type TokenVerifyResult, verifyStoredToken } from './authToken'
import type { SyncOperation } from './types'

export interface CanSendOtpResult {
  canSend: boolean
  waitSeconds: number
}

export interface RateLimitResult {
  allowed: boolean
  waitSeconds: number
}

export class UserStorage extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

  async syncData(ops: SyncOperation) {
    // 1. Delete
    if (ops.delete && ops.delete.length > 0) {
      // Validate keys
      const invalidKeys = ops.delete.filter((k) => !k.startsWith('$'))
      if (invalidKeys.length > 0) {
        throw new Error(`删除键名无效: ${invalidKeys.join(', ')}。键名必须以 '$' 开头`)
      }
      await this.ctx.storage.delete(ops.delete)
    }

    // 2. Set
    if (ops.set) {
      // Validate keys
      const invalidKeys = Object.keys(ops.set).filter((k) => !k.startsWith('$'))
      if (invalidKeys.length > 0) {
        throw new Error(`设置键名无效: ${invalidKeys.join(', ')}。键名必须以 '$' 开头`)
      }
      await this.ctx.storage.put(ops.set)
    }

    // 3. Get
    const result: Record<string, unknown> = {}
    if (ops.get && ops.get.length > 0) {
      // Validate keys
      const invalidKeys = ops.get.filter((k) => !k.startsWith('$'))
      if (invalidKeys.length > 0) {
        throw new Error(`获取键名无效: ${invalidKeys.join(', ')}。键名必须以 '$' 开头`)
      }
      const values = await this.ctx.storage.get(ops.get)
      // Merge into result
      for (const [key, value] of values) {
        result[key] = value
      }
    }

    return result
  }

  // ==================== Auth methods ====================

  /**
   * 检查是否可以发送验证码（60秒冷却）
   */
  async canSendOtp(): Promise<CanSendOtpResult> {
    const lastSentAt = await this.ctx.storage.get<number>('auth_otp_sent_at')
    if (!lastSentAt) {
      return { canSend: true, waitSeconds: 0 }
    }

    const elapsed = Date.now() - lastSentAt
    if (elapsed >= OTP_COOLDOWN_MS) {
      return { canSend: true, waitSeconds: 0 }
    }

    const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000)
    return { canSend: false, waitSeconds }
  }

  async consumeRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const countKey = `rate_limit_${key}_count`
    const startedAtKey = `rate_limit_${key}_started_at`
    const now = Date.now()
    const count = (await this.ctx.storage.get<number>(countKey)) ?? 0
    const windowStartedAt = await this.ctx.storage.get<number>(startedAtKey)
    const result = applyFixedWindowRateLimit({ count, limit, now, windowMs, windowStartedAt })

    await this.ctx.storage.put({
      [countKey]: result.count,
      [startedAtKey]: result.windowStartedAt,
    })

    return {
      allowed: result.allowed,
      waitSeconds: result.waitSeconds,
    }
  }

  /**
   * 保存验证码，同时重置失败计数
   */
  async saveOtp(otp: string): Promise<void> {
    const now = Date.now()
    const expiry = now + OTP_EXPIRY_MS
    await this.ctx.storage.put({
      auth_otp: otp,
      auth_otp_expiry: expiry,
      auth_otp_sent_at: now,
      auth_otp_fail_count: 0,
    })
  }

  /**
   * 验证 OTP，失败5次后锁定
   */
  async verifyOtp(otp: string): Promise<OtpVerificationResult> {
    const storedOtp = await this.ctx.storage.get<string>('auth_otp')
    const expiry = await this.ctx.storage.get<number>('auth_otp_expiry')
    const failCount = (await this.ctx.storage.get<number>('auth_otp_fail_count')) ?? 0
    const result = verifyStoredOtp({
      storedOtp,
      expiry,
      failCount,
      otp,
      now: Date.now(),
    })

    if (result.valid === true) {
      // 验证成功，消费验证码
      await this.ctx.storage.delete(['auth_otp', 'auth_otp_expiry', 'auth_otp_fail_count'])
      return result
    }

    const { reason } = result

    if (reason === 'expired') {
      // 验证码已过期，清除
      await this.ctx.storage.delete(['auth_otp', 'auth_otp_expiry', 'auth_otp_fail_count'])
      return result
    }

    if (reason === 'locked') {
      // 失败次数达到上限，清除OTP防止继续尝试
      await this.ctx.storage.delete(['auth_otp', 'auth_otp_expiry', 'auth_otp_fail_count'])
      return result
    }

    if (reason === 'mismatch') {
      // 验证失败，递增失败计数
      await this.ctx.storage.put('auth_otp_fail_count', failCount + 1)
    }

    return result
  }

  /**
   * 保存 token 并返回是否为新用户
   */
  async saveToken(token: string, email: string): Promise<{ isNewUser: boolean }> {
    const now = Date.now()
    const existingEmail = await this.ctx.storage.get<string>('auth_email')
    const isNewUser = !existingEmail

    await this.ctx.storage.put('auth_token', token)
    await this.ctx.storage.put('auth_token_created_at', now)
    await this.ctx.storage.put('auth_email', email)

    // 如果是新用户，记录注册时间
    if (isNewUser) {
      await this.ctx.storage.put('auth_registered_at', now)
    }

    return { isNewUser }
  }

  /**
   * 验证 token 是否有效；超过 90 天未刷新则过期
   */
  async verifyToken(token: string): Promise<TokenVerifyResult> {
    const storedToken = await this.ctx.storage.get<string>('auth_token')
    const createdAt = await this.ctx.storage.get<number>('auth_token_created_at')

    const result = verifyStoredToken({
      storedToken,
      createdAt,
      token,
      now: Date.now(),
    })

    if (!result.valid && result.expired) {
      await this.clearToken()
    }

    return result
  }

  /**
   * 刷新 token（需要验证旧 token 有效）
   */
  async refreshToken(oldToken: string): Promise<string | null> {
    const verifyResult = await this.verifyToken(oldToken)

    // 只有 token 有效且未过期时才能刷新
    if (!verifyResult.valid) {
      return null
    }

    const refreshedToken = createRefreshedTokenState({
      now: Date.now(),
    })

    await this.ctx.storage.put({
      auth_token: refreshedToken.token,
      auth_token_created_at: refreshedToken.createdAt,
    })

    return refreshedToken.token
  }

  /**
   * 清除 token（退出登录）
   */
  async clearToken(): Promise<void> {
    await this.ctx.storage.delete(['auth_token', 'auth_token_created_at'])
  }

  /**
   * 检查是否已注册
   */
  async isRegistered(): Promise<boolean> {
    const email = await this.ctx.storage.get('auth_email')
    return !!email
  }
}
