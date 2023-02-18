import { createRouter, createWebHashHistory } from 'vue-router'
import myLogin from '../components/myLogin.vue'
import myHome from '../components/myHome.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: myLogin },
  { path: '/home', component: myHome }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫，to代表访问路径，from代表从哪个地方跳转，next函数代表放行
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
