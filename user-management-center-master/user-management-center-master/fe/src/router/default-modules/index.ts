import errorRouters from './error';
import resultRouters from './result';
// import userRouters from '../modules/user';

export default [
  // {
  //   path: '/',
  //   redirect: '/list',
  // },
  // {
  //   path: '/login',
  //   name: 'login',
  //   component: () => import('@/pages/login/index.vue'),
  // },
  ...resultRouters,
  // ...userRouters,
  ...errorRouters,
  // 没有的页面 自动跳转 404 页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];
