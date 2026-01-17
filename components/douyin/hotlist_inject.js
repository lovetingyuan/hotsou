function __$inject() {
  const TARGET_URL =
    'https://lf-douyin-mobile.bytecdn.com/obj/growth-douyin-share/growth/douyin_ug/static/image/bg-hot-title.e1b11d08.png'

  const processNode = node => {
    if (
      node.nodeType === 1 &&
      node.tagName === 'X-IMAGE' &&
      node.classList?.contains('banner-image')
    ) {
      if (node.getAttribute('src') !== TARGET_URL) {
        node.setAttribute('src', TARGET_URL)
      }
    }
  }

  // 1. Check existing nodes
  document.querySelectorAll('x-image.banner-image').forEach(processNode)

  // 2. Error handling for IMG
  window.addEventListener(
    'error',
    function (e) {
      if (e.target.tagName === 'IMG' && e.target.id === 'img') {
        e.target.src = TARGET_URL
      }
    },
    true
  )

  // 3. Observe changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(processNode)
      } else if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'src'
      ) {
        processNode(mutation.target)
      }
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  })
}
const jsCode = `(${__$inject})()`
export default jsCode
