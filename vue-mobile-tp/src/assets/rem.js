/* 注意：这里的clientWidth / 375是由于我们设计是基于宽度375设计的 */
(function(doc, win) {
  let docEl = doc.documentElement
  let resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
  let recalc = function() {
    let clientWidth = docEl.clientWidth
    if (!clientWidth) return
    // docEl.style.fontSize = 20 * (clientWidth / 375) + 'px'
    // 配合postcss-plugin-px2rem rootValue:100,
    docEl.style.fontSize = (clientWidth / 3.75) + 'px'
  }
  if (!doc.addEventListener) return
  win.addEventListener(resizeEvt, recalc, false)
  doc.addEventListener('DOMContentLoaded', recalc, false)
})(document, window)
