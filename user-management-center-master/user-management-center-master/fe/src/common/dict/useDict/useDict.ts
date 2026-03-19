import { computed } from 'vue';

import { DefaultSelectOption } from '@/types/commonDefault';

import { appendOptions, getCurrentAllOptions, getCurrentOption, transformDictData, unShiftOptions } from './common';
import { DictDataInterface, dictMapJson, DictType, getDictByAPI } from './config';

/**
 * @description: 字典 钩子 函数
 * @param {DictType} type 字典 类型
 * @param {*} allOption 全部 选项
 * @param {*} allOption 全部 选项
 * @param {*} allOption 全部 选项
 *
 * @return {*}
 */
/**
 *
 * 1. 接口 获取 字典 数据
 * 2. 按照 通用数据 格式 转换 数据
 * 3. 提供 自动追加 all 选项的 字典
 * 4. 默认 已经有字典对象， 可以 直接 使用
 * 5. 提供 强制刷新 字典方法
 * 6. 通过通用 方法，传入参数，返回 字典 对象
 */
export const useDict = (type: DictType, allOption = { label: 'All', value: '' }) => {
  const dict = ref<DefaultSelectOption[]>([]);
  const sourceData = ref<DictDataInterface[DictType]>([]);
  const searchOptions = computed(() => {
    return unShiftOptions(dict.value, [allOption]) as DefaultSelectOption[];
  });
  const refresh = async (isCompelled = false) => {
    if (!isCompelled && dict.value.length) {
      return dict.value;
    }
    const res = (await getDictData(type)) as DictDataInterface[DictType];
    sourceData.value = res;
    // console.log(`getDictData --> ${type} 原始数据:`, res);
    dict.value = transformDictData(res, dictMapJson[type]) as DefaultSelectOption[];
    // console.log(`dict.value --> ${type} : `, type, dict.value);
    return dict.value;
  };
  // 获取 字典 数据
  const getDictData = async (type: DictType): Promise<DictDataInterface[DictType]> => {
    return getDictByAPI[type]();
  };
  // 获取当前选项
  const currentOption = (value: string | number) => {
    return getCurrentOption(value, dict.value);
  };
  // 获取当前选项的label
  const currentOptionLabelOf = (value: string | number) => {
    return currentOption(value)?.label;
  };

  // 获取当前选项的value
  const currentOptionValueOf = (label: string | number) => {
    return getCurrentOption(label, dict.value)?.value;
  };
  // 获取当前全部选项
  const currentAllOptions = (valueList: DefaultSelectOption['value'][]) => {
    return getCurrentAllOptions(valueList, dict.value);
  };
  // 获取当前全部选项的label
  const currentAllOptionsLabelOf = (valueList: DefaultSelectOption['value'][]) => {
    return currentAllOptions(valueList).map((item) => item.label);
  };
  // 获取当前全部选项的value
  const currentAllOptionsValueOf = (valueList: DefaultSelectOption['value'][]) => {
    return currentAllOptions(valueList).map((item) => item.value);
  };
  // 刷新 字典
  refresh();
  return {
    sourceData,
    dict,
    allOption,
    searchOptions,
    refresh,
    appendOptions,
    unShiftOptions,
    currentOption,
    currentOptionLabelOf,
    currentOptionValueOf,
    currentAllOptions,
    currentAllOptionsLabelOf,
    currentAllOptionsValueOf,
  };
};
