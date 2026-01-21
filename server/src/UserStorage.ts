import { DurableObject } from 'cloudflare:workers'
import { UserDataType } from './types'

const APP_DATA_KEY = 'appData'

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

  // Auth methods
  async saveOtp(otp: string) {
    const expiry = Date.now() + 5 * 60 * 1000 // 5 mins
    await this.ctx.storage.put('auth_otp', otp)
    await this.ctx.storage.put('auth_otp_expiry', expiry)
  }

  async verifyOtp(otp: string): Promise<boolean> {
    const storedOtp = await this.ctx.storage.get<string>('auth_otp')
    const expiry = await this.ctx.storage.get<number>('auth_otp_expiry')

    if (!storedOtp || !expiry) return false
    if (Date.now() > expiry) {
      await this.ctx.storage.delete(['auth_otp', 'auth_otp_expiry'])
      return false
    }
    if (storedOtp === otp) {
      // Consume OTP
      await this.ctx.storage.delete(['auth_otp', 'auth_otp_expiry'])
      return true
    }
    return false
  }

  async saveToken(token: string, email: string) {
    await this.ctx.storage.put('auth_token', token)
    await this.ctx.storage.put('auth_token_created_at', Date.now())
    await this.ctx.storage.put('auth_email', email)
  }

  async verifyToken(token: string): Promise<boolean> {
    const storedToken = await this.ctx.storage.get<string>('auth_token')
    return storedToken === token
  }

  async isRegistered(): Promise<boolean> {
    const email = await this.ctx.storage.get('auth_email')
    return !!email
  }
}
