import { z } from 'zod'

const OTP_DIGITS = 6
const OTP_RANGE = 10 ** OTP_DIGITS
export const OTP_EXPIRY_MS = 5 * 60 * 1000
export const OTP_COOLDOWN_MS = 60 * 1000
const OTP_MAX_FAILURES = 5

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const BearerAuthorizationHeaderSchema = z
  .string()
  .regex(/^Bearer\s+[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

export interface FixedWindowRateLimitInput {
  count: number
  limit: number
  now: number
  windowMs: number
  windowStartedAt?: number
}

export interface FixedWindowRateLimitResult {
  allowed: boolean
  count: number
  waitSeconds: number
  windowStartedAt: number
}

export type OtpVerificationFailureReason = 'missing' | 'expired' | 'locked' | 'mismatch'

export type OtpVerificationResult =
  | {
      valid: true
    }
  | {
      valid: false
      reason: OtpVerificationFailureReason
    }

export interface VerifyStoredOtpInput {
  storedOtp?: string
  expiry?: number
  failCount: number
  otp: string
  now: number
}

export function generateNumericOtp(): string {
  const random = new Uint32Array(1)
  crypto.getRandomValues(random)
  const value = random[0] % OTP_RANGE

  return value.toString().padStart(OTP_DIGITS, '0')
}

export function verifyStoredOtp({
  storedOtp,
  expiry,
  failCount,
  otp,
  now,
}: VerifyStoredOtpInput): OtpVerificationResult {
  if (!storedOtp || !expiry) {
    return { valid: false, reason: 'missing' }
  }

  if (now > expiry) {
    return { valid: false, reason: 'expired' }
  }

  if (failCount >= OTP_MAX_FAILURES) {
    return { valid: false, reason: 'locked' }
  }

  if (storedOtp !== otp) {
    return { valid: false, reason: 'mismatch' }
  }

  return { valid: true }
}

export function parseBearerToken(authorization?: string): string | null {
  if (!authorization) {
    return null
  }

  const match = authorization.match(/^Bearer\s+([^\s]+)$/i)
  if (!match) {
    return null
  }

  const token = match[1]
  return UUID_PATTERN.test(token) ? token : null
}

export function applyFixedWindowRateLimit({
  count,
  limit,
  now,
  windowMs,
  windowStartedAt,
}: FixedWindowRateLimitInput): FixedWindowRateLimitResult {
  if (!windowStartedAt || now - windowStartedAt >= windowMs) {
    return {
      allowed: true,
      count: 1,
      waitSeconds: 0,
      windowStartedAt: now,
    }
  }

  if (count >= limit) {
    return {
      allowed: false,
      count,
      waitSeconds: Math.ceil((windowMs - (now - windowStartedAt)) / 1000),
      windowStartedAt,
    }
  }

  return {
    allowed: true,
    count: count + 1,
    waitSeconds: 0,
    windowStartedAt,
  }
}
