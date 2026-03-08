import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

const CLC_IS_API_URL = 'https://clc.is/api/links'
const CLC_IS_DEFAULT_DOMAIN = 'clc.is'

const ClcIsLinkResponseSchema = z.object({
  slug: z.string().min(1),
  url: z.string().url(),
  is_generated: z.boolean(),
})

const ClcIsErrorResponseSchema = z.object({
  error: z.string(),
})

const ShortLinkCreateRequestSchema = {
  tags: ['Links'],
  summary: 'Create a short link for sharing via a third-party shortener',
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
    const data = await this.getValidatedData<typeof ShortLinkCreateRequestSchema>()
    const { url } = data.body

    try {
      const response = await fetch(CLC_IS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: CLC_IS_DEFAULT_DOMAIN,
          target_url: url,
        }),
      })
      const responseText = await response.text()
      const responseJson = JSON.parse(responseText)

      if (!response.ok) {
        const errorData = ClcIsErrorResponseSchema.safeParse(responseJson)
        throw new Error(errorData.success ? errorData.data.error : 'Shortener returned an error.')
      }

      const parsedData = z.array(ClcIsLinkResponseSchema).safeParse(responseJson)
      const shortUrl = parsedData.success
        ? parsedData.data[0]?.url
        : ClcIsLinkResponseSchema.parse(responseJson).url

      if (!shortUrl) {
        throw new Error('Shortener returned an empty URL.')
      }

      return {
        success: true,
        result: {
          shortUrl,
        },
      }
    } catch (error) {
      console.error('Failed to create short link via clc.is', error)

      return c.json(
        {
          success: false,
          error: '短链接服务暂时不可用',
        },
        502,
      )
    }
  }
}
