import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { useAppStore } from './modules/app';
import { useUserStore } from './modules/user';
import { useSettingStore } from './modules/setting';
import { usePermissionStore } from './modules/permission';
import { useTabsRouterStore } from './modules/tabs-router';
import { useNotificationStore } from './modules/notification';

const store = createPinia();
store.use(createPersistedState());

export { store, useAppStore, useUserStore, useSettingStore, usePermissionStore, useTabsRouterStore, useNotificationStore };

export default store;
