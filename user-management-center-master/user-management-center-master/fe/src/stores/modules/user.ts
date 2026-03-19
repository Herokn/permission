// import { defineStore } from 'pinia';

// import { getUserInfo as queryUserInfo, login as Login, logout as Logout } from '@/api/auth';
// import { usePermissionStore } from '@/store';
// import { LoginParams } from '@/types/api/auth';
// import type { UserInfo } from '@/types/interface';

// const InitUserInfo: UserInfo = {
//   nickName: '', // 用户名，用于展示在页面右上角头像处
//   roles: [], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用

//   userId: '', // 用户ID
//   email: '', // 邮箱地址
//   mobile: '', // 手机号
//   tenantCode: '', // 租户编码
//   tenantName: '', // 租户名称
//   username: '', // 用户名
//   avatar: '', // 头像URL
//   enabled: true, // 是否启用
//   description: '', // 描述
//   birthday: '', // 生日
//   orgId: '', // 组织ID
//   dataPermission: null, // 数据权限
//   funcPermissions: [], // 功能权限列表
// };

// export const useUserStore = defineStore('user', {
//   state: () => ({
//     token: '',
//     authenticationScheme: '', // 'Bearer', // 认证方案，默认Bearer
//     userInfo: { ...InitUserInfo },
//   }),
//   getters: {
//     roles: (state) => {
//       return state.userInfo?.roles;
//     },
//   },
//   actions: {
//     async login(loginParams: LoginParams) {
//       console.log('Login::userInfo', loginParams);
//       const res = await Login(loginParams);
//       console.log('Login::res', res);
//       this.token = res?.accessToken || '';
//       this.authenticationScheme = res?.tokenType || '';
//       return res;
//     },
//     async getUserInfo() {
//       // const mockRemoteUserInfo = async (token: string) => {
//       //   if (token === 'main_token') {
//       //     return {
//       //       name: 'Tencent',
//       //       roles: ['all'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
//       //     };
//       //   }
//       //   return {
//       //     name: 'td_dev',
//       //     roles: ['UserIndex', 'DashboardBase', 'login'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
//       //   };
//       // };
//       // const res = await mockRemoteUserInfo(this.token);
//       // const { dataPermission, funcPermissions, loginLog, ...userInfo } = await queryUserInfo();
//       // console.log('queryUserInfo::dataPermission', dataPermission);
//       // console.log('queryUserInfo::funcPermissions', funcPermissions);
//       // console.log('queryUserInfo::loginLog', loginLog);
//       // console.log('queryUserInfo::userInfo', userInfo);
//       const userInfo = await queryUserInfo();

//       this.userInfo = userInfo;
//     },
//     async logout(isLogoutApi = false) {
//       this.token = '';
//       this.userInfo = { ...InitUserInfo };
//       // 根据条件调用退出接口
//       isLogoutApi && (await Logout());
//     },
//   },
//   persist: {
//     afterRestore: () => {
//       const permissionStore = usePermissionStore();
//       permissionStore.initRoutes();
//     },
//     key: 'user',
//     paths: ['token', 'authenticationScheme'],
//   },
// });
