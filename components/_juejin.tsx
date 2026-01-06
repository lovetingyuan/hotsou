import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  document.addEventListener(
    'click',
    event => {
      // @ts-ignore
      const parent = event.target.closest('a.article-item-link')
      if (parent) {
        // 阻止默认行为（在新标签页打开）
        event.preventDefault()
        event.stopPropagation()

        // 获取链接地址
        // @ts-ignore
        const href = parent.getAttribute('href')

        // 在当前页面打开链接
        if (href) {
          window.location.href = href
        }
      }
    },
    true
  )
}

export default function Juejin() {
  return (
    <WebView
      name={TabsName.juejin}
      url={getTabUrl(TabsName.juejin)!}
      js={`(${__$inject})()`}
      css={`
        .view-container header {
          display: none !important;
        }
        div.nav-item-wrap {
          flex-wrap: wrap !important;
        }
        div.sub-nav-item-wrap {
          flex-wrap: wrap !important;
          gap: 10px;
        }
        .hot-list-title {
          height: 80px !important;
        }
        .article-number {
          margin-right: 10px !important;
        }
        .article-right {
          display: none !important;
        }
        .hot-list-wrap {
          padding-inline: 0 !important;
        }
        .open-button.app-open-button {
          display: none !important;
        }
        .comment-form.comment-editor {
          display: none !important;
        }
        .main-container > .view {
          margin-top: 0 !important;
        }
      `}
      forbiddenUrls={['mcs.snssdk.com']}
    />
  )
}
