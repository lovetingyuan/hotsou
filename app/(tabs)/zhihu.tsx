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
        .Question-mainEntity > div:nth-of-type(2) {
          display: none;
        }
        .MobileModal-wrapper {
          display: none !important;
        }
      `}
      js={`
        if (root) {
         const title = document.createElement('h1')
         title.className = 'zhihu-title'
         title.textContent = '知乎热榜'
         root.prepend(title)
        }
         setInterval(() => {
          const btn = document.querySelector('.MobileModal-wrapper button')
          if (btn) {
            btn.click()
          }
         }, 200);
        `}
      url={'https://www.zhihu.com/billboard'}
    ></WebView>
  )
}
