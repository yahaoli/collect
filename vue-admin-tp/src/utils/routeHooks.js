import router from "@/router";
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
router.beforeEach(async (to, from, next) => {
  // const whiteList = ['/login'] // no redirect whitelist
  NProgress.start();
  next();
  NProgress.done();
  // if (whiteList.indexOf(to.path) !== -1) {
  //   // in the free login whitelist, go directly
  //   next()
  // }
});