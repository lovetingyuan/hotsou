function __$inject() {
  window.addEventListener(
    'error',
    function (e) {
      if (e.target.tagName === 'IMG' && e.target.id === 'img') {
        e.target.src =
          'https://lf-douyin-mobile.bytecdn.com/obj/growth-douyin-share/growth/douyin_ug/static/image/bg-hot-title.e1b11d08.png'
      }
    },
    true
  )
}
const jsCode = `(${__$inject})()`
export default jsCode
