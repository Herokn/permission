export default [
  {
    path: '/login',
    component: () => import('@/layouts/blank.vue'),
    meta: { title: 'pages.login.loginTitle', fixed: true },
    children: [
      { path: '', component: () => import('@/pages/login/index.vue'), meta: { title: 'Login', fixed: true } },
    ],
  },
];

