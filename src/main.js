import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueLzayLoad from 'vue-lazyload'

Vue.use(VueLzayLoad, {
  loading: require('@/common/image/default.png')
})

import fastclick from 'fastclick'
// 移动端300ms 延迟
fastclick.attach(document.body)

Vue.config.productionTip = false
// 公共css
import './common/stylus/index.styl'
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
