import WebView from '@/components/WebView'

export default function Weibo() {
  return (
    <WebView
      url={'https://m.weibo.cn/p/106003type=25&t=3&disable_hot=1&filter_type=realtimehot'}
      css={`
        div.card.m-panel.card4:has(img[src*='point_orange']) {
          display: none;
        }
        .npage-bg,
        .nav-left,
        .m-tab-bar.m-bar-panel.m-container-max {
          display: none;
        }
      `}
      showReloadButton
    ></WebView>
  )
}
