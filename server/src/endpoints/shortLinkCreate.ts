import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { factory } from '../factory'
import { validationHook } from '../validation'

const CLC_IS_API_URL = 'https://clc.is/api/links'
const CLC_IS_DEFAULT_DOMAIN = 'clc.is'

const ClcIsLinkResponseSchema = z.object({
  slug: z.string().min(1),
  url: z.url(),
  is_generated: z.boolean(),
})

const ClcIsErrorResponseSchema = z.object({
  error: z.string(),
})

const ShortLinkCreateBodySchema = z.object({
  url: z.url(),
})

export const ShortLinkCreate = factory.createHandlers(
  zValidator('json', ShortLinkCreateBodySchema, validationHook),
  async (c) => {
    const { url } = c.req.valid('json')

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

      return c.json({
        success: true,
        result: {
          shortUrl,
        },
      })
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
  },
)
