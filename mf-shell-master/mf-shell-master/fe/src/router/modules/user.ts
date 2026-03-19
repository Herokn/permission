import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/users',
    component: Layout,
    name: 'UserManagement',
    meta: {
      title: 'User Management Center',
      icon: 'user-group',
    },
    children: [
      {
        path: ':pathMatch(.*)*',
        name: 'UserManagementApp',
        component: () => import('@/components/MicroAppContainer.vue'),
        meta: { title: 'User Management Center' },
      },
    ],
  },
];
