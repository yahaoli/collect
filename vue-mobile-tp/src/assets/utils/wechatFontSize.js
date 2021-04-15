// 微信字体调整的兼容
(function() {
  // eslint-disable-next-line
  if (typeof WeixinJSBridge === 'object' && typeof WeixinJSBridge.invoke === 'function') {
    handleFontSize();
  } else {
    document.addEventListener('WeixinJSBridgeReady', handleFontSize, false);
  }
  function handleFontSize() {
    // 设置网页字体为默认大小
    // eslint-disable-next-line
    WeixinJSBridge.invoke('setFontSizeCallback&', { 'fontSize': 2 });
    // 重写设置网页字体大小的事件
    // eslint-disable-next-line
    WeixinJSBridge.on('menu:setfont', function() {
      // eslint-disable-next-line
      WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize': 2 });
    });
  }
})();