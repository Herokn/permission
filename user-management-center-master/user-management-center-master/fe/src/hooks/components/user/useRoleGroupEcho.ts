// import { createGlobalState } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';

import { getRoleGroupList } from '@/api/system-setting/user';
import type { RoleGroupItem, RoleItem } from '@/types/api/system-setting/user';

// createGlobalState(
export const useRoleGroupEcho = () => {
  const loading = ref(false);
  const availableRoles = ref<RoleGroupItem[]>([]);
  const localSelectedRoleIds = ref<string[]>([]);

  const availableRolesFlatten = computed<RoleItem[]>(() =>
    availableRoles.value.flatMap((group) => group.listRoles || []),
  );

  const selectedRoles = computed<RoleItem[]>(() =>
    availableRolesFlatten.value.filter((role) => localSelectedRoleIds.value.includes(role.id)),
  );

  const queryRoleGroupList = async (userId?: string) => {
    loading.value = true;
    try {
      const res = await getRoleGroupList({ userId: userId ?? '' });
      availableRoles.value = res || [];

      localSelectedRoleIds.value = [];
      availableRolesFlatten.value.forEach((role) => {
        if ((role as any).selected) {
          localSelectedRoleIds.value.push(role.id);
        }
      });

      return availableRoles.value;
    } catch (error) {
      console.error('getRoleGroupList error:', error);
      MessagePlugin.error('Failed to load roles');
      return [] as RoleGroupItem[];
    } finally {
      loading.value = false;
    }
  };

  const echo = () => {
    return { roleIds: [...localSelectedRoleIds.value], roles: [...selectedRoles.value] };
  };

  const setSelectedRoleIds = (ids: string[]) => {
    localSelectedRoleIds.value = [...ids];
  };

  const resetSelection = () => {
    localSelectedRoleIds.value = [];
  };

  return {
    loading,
    availableRoles,
    availableRolesFlatten,
    localSelectedRoleIds,
    selectedRoles,
    queryRoleGroupList,
    echo,
    setSelectedRoleIds,
    resetSelection,
  };
}; // );
