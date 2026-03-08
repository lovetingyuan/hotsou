import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

const IS_GD_ENDPOINT = 'https://is.gd/create.php?format=simple&url='

const ShortLinkCreateRequestSchema = {
  tags: ['Links'],
  summary: 'Create a short link for sharing via third-party shortener',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            url: z.string().url(),
          }),
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Short link created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            result: z.object({
              shortUrl: Str(),
            }),
          }),
        },
      },
    },
    '502': {
      description: 'Third-party shortener failed',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            error: Str(),
          }),
        },
      },
    },
  },
}

export class ShortLinkCreate extends OpenAPIRoute {
  schema = ShortLinkCreateRequestSchema

  async handle(c: AppContext) {
    console.log(999, 444)

    const data = await this.getValidatedData<typeof ShortLinkCreateRequestSchema>()
    const { url } = data.body
    const response = await fetch(`${IS_GD_ENDPOINT}${encodeURIComponent(url)}`)
    console.log(999, 33, url)

    const shortUrl = (await response.text()).trim()
    console.log(999, 3344, shortUrl)

    if (!response.ok || !shortUrl.startsWith('https://')) {
      return c.json(
        {
          success: false,
          error: '短链接服务暂时不可用',
        },
        502,
      )
    }

    return {
      success: true,
      result: {
        shortUrl,
      },
    }
  }
}
