import { DurableObject } from 'cloudflare:workers'
import { UserDataType } from './types'

const APP_DATA_KEY = 'appData'

// 时间常量
const OTP_EXPIRY_MS = 60 * 1000 // 1分钟
const OTP_COOLDOWN_MS = 60 * 1000 // 60秒冷却
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 1周
const TOKEN_REFRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 1天

export interface TokenVerifyResult {
  valid: boolean
  expired: boolean
  needRefresh: boolean
}

export interface CanSendOtpResult {
  canSend: boolean
  waitSeconds: number
}

export class UserStorage extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

  async getData() {
    const data = await this.ctx.storage.get<UserDataType>(APP_DATA_KEY)
    return data || null
  }

  async saveData(data: UserDataType) {
    await this.ctx.storage.put(APP_DATA_KEY, data)
  }

  async createData(data: UserDataType) {
    const existing = await this.ctx.storage.get(APP_DATA_KEY)
    if (existing) {
      throw new Error('User data already exists')
    }
    await this.ctx.storage.put(APP_DATA_KEY, data)
  }

  async updateData(data: UserDataType) {
    const existing = await this.ctx.storage.get(APP_DATA_KEY)
    if (!existing) {
      throw new Error('User data not found')
    }
    await this.ctx.storage.put(APP_DATA_KEY, data)
  }

  async deleteData() {
    await this.ctx.storage.delete(APP_DATA_KEY)
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

  /**
   * 保存验证码（1分钟过期）
   */
  async saveOtp(otp: string): Promise<void> {
    const now = Date.now()
    const expiry = now + OTP_EXPIRY_MS
    await this.ctx.storage.put('auth_otp', otp)
    await this.ctx.storage.put('auth_otp_expiry', expiry)
    await this.ctx.storage.put('auth_otp_sent_at', now)
  }

  /**
   * 验证 OTP
   */
  async verifyOtp(otp: string): Promise<boolean> {
    const storedOtp = await this.ctx.storage.get<string>('auth_otp')
    const expiry = await this.ctx.storage.get<number>('auth_otp_expiry')

    if (!storedOtp || !expiry) return false
    if (Date.now() > expiry) {
      // 验证码已过期，清除
      await this.ctx.storage.delete(['auth_otp', 'auth_otp_expiry'])
      return false
    }
    if (storedOtp === otp) {
      // 验证成功，消费验证码
      await this.ctx.storage.delete(['auth_otp', 'auth_otp_expiry'])
      return true
    }
    return false
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
   * 验证 token，检查是否有效、是否过期、是否需要刷新
   */
  async verifyToken(token: string): Promise<TokenVerifyResult> {
    const storedToken = await this.ctx.storage.get<string>('auth_token')
    const createdAt = await this.ctx.storage.get<number>('auth_token_created_at')

    // token 不匹配
    if (!storedToken || storedToken !== token) {
      return { valid: false, expired: false, needRefresh: false }
    }

    // 检查 token 是否过期（1周）
    if (!createdAt) {
      return { valid: false, expired: true, needRefresh: false }
    }

    const now = Date.now()
    const tokenAge = now - createdAt

    if (tokenAge > TOKEN_EXPIRY_MS) {
      return { valid: false, expired: true, needRefresh: false }
    }

    // 检查是否需要刷新（距离上次刷新超过1天）
    const needRefresh = tokenAge > TOKEN_REFRESH_THRESHOLD_MS

    return { valid: true, expired: false, needRefresh }
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

    // 生成新 token
    const newToken = crypto.randomUUID()
    const now = Date.now()

    await this.ctx.storage.put('auth_token', newToken)
    await this.ctx.storage.put('auth_token_created_at', now)

    return newToken
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
