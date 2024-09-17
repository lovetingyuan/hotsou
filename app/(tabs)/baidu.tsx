import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.hostname === 'top.baidu.com') {
    history.scrollRestoration = 'auto'
    // @ts-ignore
    window.__markReaded?.(
      '.row-start-center',
      'div:nth-child(2) > span',
      '.row-start-center > div:nth-child(2) > span'
    )
  }
}

export default function Baidu() {
  return (
    <WebView
      name={TabsName.baidu}
      url={'https://top.baidu.com/board?tab=realtime'}
      js={`(${__$inject})()`}
      css={`
        #bdrainrwDragButton,
        #page-copyright {
          display: none !important;
        }
        .row-start-center:has(img[src*='redtop']) {
          display: none;
        }
        #page-ft {
          margin-bottom: 20px;
        }
      `}
      forbiddenUrls={['activity.baidu.com/mbox', 'wappass.baidu.com']}
    />
  )
}
