import { RouteRecordRaw } from 'vue-router'

/**
 * Token bridge route
 * Handle token processing when embedded from other systems
 */
export default [
  {
    path: '/token-bridge',
    name: 'TokenBridge',
    component: () => import('@/pages/TokenBridge.vue'),
    meta: {
      // Mark as fixed route, no permission validation required
      fixed: true,
      title: 'Verifying Identity',
    },
  },
] as Array<RouteRecordRaw>
