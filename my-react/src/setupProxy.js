const proxy = require("http-proxy-middleware");

module.exports = function(app) {
  /*app.use(
    proxy("/computer", {
      target: "http://cloud.dev.xisland.cn",
      changeOrigin: true,
      cookieDomainRewrite:{
        '*':'localhost' // 把相应的 cookie 域都设置成 localhost，或者指定的域名
      }
    })

  );*/
};
