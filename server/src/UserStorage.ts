import { DurableObject } from 'cloudflare:workers'
import { UserDataType } from './types'

export class UserStorage extends DurableObject {
  sql: SqlStorage

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env)
    // Initialize the database table
    this.sql = ctx.storage.sql
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT PRIMARY KEY,
        data TEXT
      );
    `)
  }

  async getData(userId: string) {
    const cursor = this.sql.exec('SELECT data FROM user_data WHERE user_id = ?', userId)
    const result = cursor.toArray()

    if (result.length === 0) {
      return null
    }

    return JSON.parse(result[0].data as string) as UserDataType
  }

  async saveData(userId: string, data: UserDataType) {
    this.sql.exec(
      'INSERT INTO user_data (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data',
      userId,
      JSON.stringify(data),
    )
  }

  async createData(userId: string, data: UserDataType) {
    const exists =
      this.sql.exec('SELECT 1 FROM user_data WHERE user_id = ?', userId).toArray().length > 0
    if (exists) {
      throw new Error('User data already exists')
    }
    this.sql.exec(
      'INSERT INTO user_data (user_id, data) VALUES (?, ?)',
      userId,
      JSON.stringify(data),
    )
  }

  async updateData(userId: string, data: UserDataType) {
    const exists =
      this.sql.exec('SELECT 1 FROM user_data WHERE user_id = ?', userId).toArray().length > 0
    if (!exists) {
      throw new Error('User data not found')
    }
    this.sql.exec('UPDATE user_data SET data = ? WHERE user_id = ?', JSON.stringify(data), userId)
  }

  async deleteData(userId: string) {
    this.sql.exec('DELETE FROM user_data WHERE user_id = ?', userId)
  }
}
