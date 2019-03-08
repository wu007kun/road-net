import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/app-list'
    }, {
      name: 'appList',
      path: '/app-list',
      component: () => import('@/views/AppList')
    }, {
      name: 'adjust',
      path: '/adjust',
      component: () => import('@/views/Adjust')
    }, {
      name: 'roadNet',
      path: '/road-net',
      component: () => import('@/views/RoadNet')
    }
  ]
})
