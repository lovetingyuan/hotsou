const RESEND_API_URL = 'https://api.resend.com/emails'
const FROM_EMAIL = 'hotsou@tingyuan.in'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

interface SendEmailResult {
  success: boolean
  error?: string
}

/**
 * 使用 Resend 发送邮件
 */
export async function sendEmail(
  apiKey: string,
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Email] Failed to send email:', errorData)
      return {
        success: false,
        error: (errorData as { message?: string }).message || 'Failed to send email',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[Email] Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 发送 OTP 验证码邮件
 */
export async function sendOtpEmail(
  apiKey: string,
  email: string,
  otp: string,
): Promise<SendEmailResult> {
  const subject = 'HotSou 登录验证码'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">HotSou 登录验证码</h2>
      <p style="color: #666; font-size: 16px;">您的验证码是：</p>
      <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px; margin: 20px 0;">
        ${otp}
      </p>
      <p style="color: #999; font-size: 14px;">验证码有效期为 1 分钟，请尽快使用。</p>
      <p style="color: #999; font-size: 14px;">如果您没有请求此验证码，请忽略此邮件。</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #bbb; font-size: 12px;">此邮件由 HotSou 自动发送，请勿回复。</p>
    </div>
  `

  return sendEmail(apiKey, { to: email, subject, html })
}
