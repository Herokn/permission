import Layout from '@/layouts/index.vue'

export default [
  {
    path: '/',
    component: Layout,
    redirect: () => {
      // 判断localStorage中是否有token
      try {
        const userStoreData = localStorage.getItem('user')
        if (userStoreData) {
          const userData = JSON.parse(userStoreData)
          const token = userData.token || ''
          if (token) {
            // 有token则跳转到dashboard
            return '/dashboard'
          }
        }
      } catch (e) {
        console.warn('Failed to parse user store data:', e)
      }
      // 没有token则跳转到登录页
      return '/login'
    },
    name: 'root',
    meta: {
      title: '工作台',
      icon: 'dashboard',
    },
    children: [
      {
        path: 'dashboard/:pathMatch(.*)*',
        name: 'Dashboard',
        component: () => import('@/components/MicroAppContainer.vue'),
        meta: { title: 'User Management Center' },
      },
    ],
  },
]
