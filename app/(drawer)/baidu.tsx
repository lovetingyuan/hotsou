import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.hostname === 'top.baidu.com') {
    history.scrollRestoration = 'auto'
    // @ts-ignore
    window.__markReaded?.('.c-text-item', '.item-word', '.c-text-item .item-word')
  }
}
/**
 *
 * @returns  #bdrainrwDragButton,
        #page-copyright,
        .invokeAppBtnWrapper,
        .newHeadDeflectorWrapper {
          display: none !important;
        }
        .row-start-center:has(img[src*='redtop']) {
          display: none;
        }
        #page-ft {
          margin-bottom: 20px;
        }
 */
export default function Baidu() {
  return (
    <WebView
      name={TabsName.baidu}
      url={getTabUrl(TabsName.baidu)!}
      js={`(${__$inject})()`}
      css={`
        #hot0 {
          display: none !important;
        }
      `}
      forbiddenUrls={['activity.baidu.com/mbox', 'wappass.baidu.com']}
    />
  )
}
