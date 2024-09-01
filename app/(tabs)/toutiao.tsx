import WebView from '@/components/WebView'

export default function Toutiao() {
  return (
    <WebView
      url={'https://api.toutiaoapi.com/feoffline/hotspot_and_local/html/hot_list/index.html'}
      js={"history.scrollRestoration = 'auto'"}
      css={`
        .float-activate-button-container,
        #top-banner-container {
          display: none !important;
        }
      `}
    ></WebView>
  )
}
