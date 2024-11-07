import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  setInterval(() => {
    const btn = document.querySelector('.MobileModal-wrapper button')
    if (btn) {
      // @ts-ignore
      btn.click()
    }
  }, 200)
  // @ts-ignore
  window.__markReaded?.('.HotList-item', '.HotList-itemTitle', '.HotList-item .HotList-itemTitle')
}

export default function Zhihu() {
  return (
    <WebView
      name={TabsName.zhihu}
      url={getTabUrl(TabsName.zhihu)!}
      forbiddenUrls={['zhihu-web-analytics.zhihu.com', 'datahub.zhihu.com', 'apm.zhihu.com']}
      css={`
        .OpenInAppButton,
        .OpenInApp,
        .MobileModal-wrapper,
        .MHotFeedAd,
        .AdBelowMoreAnswers,
        .KfeCollection-VipRecommendCard,
        .MBannerAd {
          display: none !important;
        }
        .Question-mainEntity > div:nth-of-type(2) {
          display: none !important;
        }
        main.App-main::before {
          content: '知乎热榜';
          display: block;
          font-size: 22px;
          line-height: 55px;
          text-align: center;
        }
      `}
      js={`(${__$inject})()`}
    />
  )
}
