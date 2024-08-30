import WebView from '@/components/WebView'

export default function Zhihu() {
  return (
    <WebView
      css={`
        .OpenInAppButton,
        .OpenInApp {
          display: none;
        }
        .zhihu-title {
          text-align: center;
          font-size: 20px;
          padding: 10px;
        }
      `}
      js={`
        if (root) {
         const title = document.createElement('h1')
         title.className = 'zhihu-title'
         title.textContent = '知乎热榜'
         root.prepend(title)
        }
        `}
      url={'https://www.zhihu.com/billboard?utm_id=0'}
    ></WebView>
  )
}
