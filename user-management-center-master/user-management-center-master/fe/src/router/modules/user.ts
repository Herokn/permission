// import Layout from '@/layouts/index.vue';

// export default [
//  { path: '/list', component: () => import('@/pages/users/index.vue') },
// ];

import Layout from '@/layouts/user-center/index.vue'

export default [
  {
    path: '/',
    name: 'users-center',
    component: Layout,
    redirect: '/organization',
    // meta: {
    //   title: {
    //     zh_CN: '结果页',
    //     en_US: 'Result',
    //   },
    //   icon: 'check-circle',
    // },
    children: [
      {
        path: 'list',
        name: 'users-management',
        component: () => import('@/pages/user-management/index.vue'),
        // meta: {
        //   title: {
        //     zh_CN: '成功页',
        //     en_US: 'Success',
        //   },
        // },
      },

      {
        path: 'organization',
        name: 'organization-management',
        component: () => import('@/pages/organization/index.vue'),
        // meta: {
        //   title: {
        //     zh_CN: '成功页',
        //     en_US: 'Success',
        //   },
        // },
      },
      {
        path: 'position',
        name: 'position-management',
        component: () => import('@/pages/positions/index.vue'),
        // meta: {
        //   title: {
        //     zh_CN: '岗位管理',
        //     en_US: 'Positions',
      },

      {
        path: 'work',
        name: 'work-management',
        component: () => import('@/pages/users/index.vue'),
        // meta: {
        //   title: {
        //     zh_CN: '成功页',
        //     en_US: 'Success',
        //   },
        // },
      },
    ],
  },
]
