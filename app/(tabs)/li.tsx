import WebView from '@/components/WebView'
import { SimpleCrypto } from '@/utils'

const ch = new SimpleCrypto(process.env.EXPO_PUBLIC_LI_URL_ENC_KEY!)

export default function Li() {
  return (
    <WebView
      css={`
        .tgme_widget_message_bubble {
          margin: 0;
          margin-left: 5px;
          border-radius: 10px;
        }
        .tgme_widget_message_user_photo {
          display: none;
        }
        .tgme_widget_message_bubble_tail {
          display: none;
        }
        .tgme_widget_message_inline_keyboard {
          display: none;
        }
      `}
      url={ch.decrypt(process.env.EXPO_PUBLIC_LI_URL_MI_TEXT!)}
    ></WebView>
  )
}
