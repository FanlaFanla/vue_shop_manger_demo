import { createRouter, createWebHashHistory } from 'vue-router'
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Categories from '../components/goods/Categories'
// import Params from '../components/goods/Params.vue'
// import List from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'

// 使用路由懒加载
const Login = () => import(/* webpackChunkName: "group-login-home-welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "group-login-home-welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "group-login-home-welcome" */ '../components/Welcome.vue')
const Users = () => import(/* webpackChunkName: "group-users-rights-roles" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "group-users-rights-roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "group-users-rights-roles" */ '../components/power/Roles.vue')
const Categories = () => import(/* webpackChunkName: "group-cate-params" */ '../components/goods/Categories')
const Params = () => import(/* webpackChunkName: "group-cate-params" */ '../components/goods/Params.vue')
const List = () => import(/* webpackChunkName: "group-list-add" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "group-list-add" */ '../components/goods/Add.vue')
const Order = () => import(/* webpackChunkName: "group-order-report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "group-order-report" */ '../components/report/Report.vue')

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Categories },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
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
