import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'
import { dateFormat } from './assets/js/my.js'
// 网络请求进度条
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

// 引入字体icon
import './assets/iconfont/iconfont.css'

const app = createApp(App)

// axios全局挂载
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 拦截请求头自动添加属性
axios.interceptors.request.use(config => {
  nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  nprogress.done()
  return config
})
app.config.globalProperties.$axios = axios

// 时间格式化
app.config.globalProperties.$dateFormat = dateFormat

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus).use(router).mount('#app')
