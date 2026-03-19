import { computed } from 'vue';

import { DefaultSelectOption } from '@/types/commonDefault';

import { appendOptions, getCurrentOption, transformDictData, unShiftOptions } from './common';
import { dictLocalMapJson, getLocalDict, LocalDictDataInterface, LocalDictType } from './config';

/**
 * @description: 字典 钩子 函数
 * @param {LocalDictType} type 字典 类型
 * @param {*} allOption 全部 选项
 * @return {*}
 */
export const useLocalDict = (type: LocalDictType, allOption = { label: 'All', value: '' }) => {
  const dict = ref<DefaultSelectOption[]>([]);
  const searchOptions = computed(() => {
    return unShiftOptions(dict.value, [allOption]) as DefaultSelectOption[];
  });
  const refresh = () => {
    const res = getDictData(type) as LocalDictDataInterface[LocalDictType];
    // 如果 有 映射 关系，则 按照 映射 关系 转换 数据
    dict.value = (
      dictLocalMapJson && type in dictLocalMapJson
        ? transformDictData(res, dictLocalMapJson[type] as Record<string, string>)
        : res
    ) as DefaultSelectOption[];

    return dict.value;
  };
  // 获取 字典 数据
  const getDictData = (type: LocalDictType): LocalDictDataInterface[LocalDictType] => {
    return getLocalDict[type];
  };
  // 获取当前选项
  const currentOption = (value: string | number) => {
    return getCurrentOption(value, dict.value);
  };
  // 获取当前选项的label
  const currentOptionLabelOf = (value: string | number) => {
    return currentOption(value)?.label;
  };
  // 刷新 字典
  refresh();
  return {
    dict,
    allOption,
    searchOptions,
    refresh,
    appendOptions,
    unShiftOptions,
    currentOption,
    currentOptionLabelOf,
  };
};
