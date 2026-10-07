export const AUTH_TOKEN_EXPIRY_MS = 90 * 24 * 60 * 60 * 1000

export interface TokenVerifyResult {
  valid: boolean
  expired: boolean
}

export interface VerifyStoredTokenInput {
  storedToken?: string
  createdAt?: number
  token: string
  now: number
}

export function verifyStoredToken({
  storedToken,
  createdAt,
  token,
  now,
}: VerifyStoredTokenInput): TokenVerifyResult {
  if (!storedToken || storedToken !== token) {
    return { valid: false, expired: false }
  }

  if (createdAt === undefined) {
    return { valid: false, expired: true }
  }

  if (now - createdAt >= AUTH_TOKEN_EXPIRY_MS) {
    return { valid: false, expired: true }
  }

  return { valid: true, expired: false }
}
