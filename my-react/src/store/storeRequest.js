import store from './index';
import { weatherFather } from './actions';
import { weatherFatherService } from '@/utils/service';

/**
 * 一些异步请求需要缓存到store里的数据
 */
export function weatherFatherStore() {
  return new Promise((resolve) => {
    let state = store.getState();
    if (state.weatherFather) return resolve(state.weatherFather);
    weatherFatherService().then((res) => {
      store.dispatch(weatherFather(res));
      resolve(res);
    }).catch((err) => {
      console.log(err);
    });
  });

}
