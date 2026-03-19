import { defineStore } from 'pinia';
import { store } from '@/stores';
import { NotificationItem } from '@/types/interface';

const msgData = [
  {
    id: '123',
    content: '腾讯大厦一楼改造施工项目 已通过审核！',
    type: '合同动态',
    status: true,
    collected: false,
    date: '2021-01-01 08:00',
    quality: 'high',
  },
  {
    id: '124',
    content: '三季度生产原材料采购项目 开票成功！',
    type: '票据动态',
    status: true,
    collected: false,
    date: '2021-01-01 08:00',
    quality: 'low',
  },
  {
    id: '125',
    content: '2021-01-01 10:00',
    type: '合同动态',
    status: true,
    collected: false,
    date: '2021-01-01 08:00',
    quality: 'middle',
  },
];

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    msgData: msgData as NotificationItem[],
  }),
  getters: {
    unreadMsg: (state) => state.msgData.filter((item) => item.status),
  },
  actions: {
    setMsgData(data: NotificationItem[]) {
      this.msgData = data;
    },
  },
});

export function getNotificationStore() {
  return useNotificationStore(store);
}
