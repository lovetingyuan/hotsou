import { DurableObject } from 'cloudflare:workers'
import { UserDataType } from './types'

export class UserStorage extends DurableObject {
  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env)
  }

  async getData(userEmail: string) {
    const data = await this.ctx.storage.get<UserDataType>(userEmail)
    return data || null
  }

  async saveData(userEmail: string, data: UserDataType) {
    await this.ctx.storage.put(userEmail, data)
  }

  async createData(userEmail: string, data: UserDataType) {
    const existing = await this.ctx.storage.get(userEmail)
    if (existing) {
      throw new Error('User data already exists')
    }
    await this.ctx.storage.put(userEmail, data)
  }

  async updateData(userEmail: string, data: UserDataType) {
    const existing = await this.ctx.storage.get(userEmail)
    if (!existing) {
      throw new Error('User data not found')
    }
    await this.ctx.storage.put(userEmail, data)
  }

  async deleteData(userEmail: string) {
    await this.ctx.storage.delete(userEmail)
  }
}
