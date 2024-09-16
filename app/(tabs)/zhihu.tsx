import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'

function __$inject() {
  const root = document.getElementById('root')
  if (root) {
    const title = document.createElement('h1')
    title.className = 'zhihu-title'
    title.textContent = '知乎热榜'
    root.prepend(title)
  }
  setInterval(() => {
    const btn = document.querySelector('.MobileModal-wrapper button')
    if (btn) {
      // @ts-ignore
      btn.click()
    }
  }, 200)
}

export default function Zhihu() {
  return (
    <WebView
      name={TabsName.zhihu}
      url={'https://www.zhihu.com/billboard'}
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
        .zhihu-title {
          text-align: center;
          font-size: 20px;
          padding: 10px;
        }
        .Question-mainEntity > div:nth-of-type(2) {
          display: none !important;
        }
      `}
      js={`(${__$inject})()`}
    />
  )
}
