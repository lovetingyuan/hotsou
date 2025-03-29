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
      forbiddenUrls={[
        'zhihu-web-analytics.zhihu.com',
        'datahub.zhihu.com',
        'apm.zhihu.com',
        'www.zhihu.com/oia/answers/',
        'www.zhihu.com/oia/people/',
      ]}
      css={`
        .OpenInAppButton,
        .OpenInApp,
        .MobileModal-wrapper,
        .MHotFeedAd,
        .AdBelowMoreAnswers,
        .KfeCollection-VipRecommendCard,
        .MBannerAd,
        .RelatedReadingsItem:has(.MRelateFeedAd),
        .WeiboAd-wrap {
          display: none !important;
        }
        .Question-mainEntity > div:nth-of-type(2) {
          display: none !important;
        }
        main.App-main::after {
          content: '暂无更多';
          display: block;
          font-size: 16px;
          margin: 10px 0;
          color: #888;
          text-align: center;
        }
      `}
      js={`(${__$inject})()`}
    />
  )
}
