import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    name: 'Account',
    meta: { title: 'Account Setting', icon: 'user-circle' },
    children: [
      {
        path: 'index',
        name: 'AccountSetting',
        component: () => import('@/pages/user/setting.vue'),
        meta: { title: 'Account Setting' },
      },
    ],
  },
];
