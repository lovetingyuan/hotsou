import { OpenAPIRoute } from 'chanfana'
import * as cheerio from 'cheerio'
import { z } from 'zod'
import { type AppContext } from '../types'

const ReleaseSchema = z.object({
  version: z.string(),
  date: z.string().optional(),
  changelog: z.string(),
})

export class AppVersion extends OpenAPIRoute {
  schema = {
    tags: ['App'],
    summary: 'Get App Version',
    responses: {
      '200': {
        description: 'Returns the latest app version info',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              result: z.object({
                version: ReleaseSchema,
              }),
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext) {
    const html = await fetch('https://github.com/lovetingyuan/hotsou/releases/').then(r => r.text())
    const $ = cheerio.load(html)
    const $item = $('.Box-body').first()

    const version = $item.find('a').first().text().trim()
    const date = $item.closest('section').find('relative-time').first().attr('datetime')
    const changelog = $item.find('.markdown-body').text().trim()

    return {
      success: true,
      result: {
        version: {
          version,
          date,
          changelog,
        },
      },
    }
  }
}
