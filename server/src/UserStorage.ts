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
}
