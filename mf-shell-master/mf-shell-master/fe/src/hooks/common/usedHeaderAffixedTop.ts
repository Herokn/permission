import { computed } from 'vue';

import { prefix } from '@/config/global';
import { useSettingStore } from '@/stores';

export const usedHeaderAffixedTop = (surplusStr = '-layout') => {
  const store = useSettingStore();
  const headerAffixedTop = computed(
    () =>
      ({
        offsetTop: store.isUseTabsRouter ? 48 : 0,
        container: `.${prefix}${surplusStr}`,
      } as any),
  );

  return {
    headerAffixedTop,
  };
};
