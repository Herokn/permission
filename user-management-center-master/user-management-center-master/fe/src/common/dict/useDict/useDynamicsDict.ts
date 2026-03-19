import { computed } from 'vue';

import { DefaultSelectOption } from '@/types/commonDefault';

import { appendOptions, getCurrentOption, transformDictData, unShiftOptions } from './common';
import { dictDynamicsMapJson, DynamicsDictDataInterface, DynamicsDictType, getDynamicsDictByAPI } from './config';

/** ************* hook 开始 ************* */
/**
 *  参数：
 *  type: 字典 类型
 *  allOption: 全部 选项
 *  params: 接口查询 参数
 *
 *  from: 表单对象
 *  *** key: 表单对象 对应的 key
 *  *** triggerKey: 表单对象 对应的 触发的key
 *  changeCallBack: 表单对象 触发 回调
 *
 */

interface UseDynamicsDictOptions<T> {
  allOption?: { label: string; value: string; key?: string | number };
  getParams?: () => T;
  // formData?: any;
  // key?: string;
  // triggerKey?: string;
  changeCallBack?: any;
}
// dynamics 动态 字典
export const useDynamicsDict = <T>(
  type: DynamicsDictType,
  opt: UseDynamicsDictOptions<T> = {
    allOption: { label: 'All', value: '', key: '' },
    getParams: () => ({} as T),
    changeCallBack: null,
  },
) => {
  const dict = ref<DefaultSelectOption[]>([]);
  const dictInitParamsBackUp = ref<string>('');
  const dictInitBackUp = ref<DefaultSelectOption[]>([]);

  const options: UseDynamicsDictOptions<T> = {
    allOption: { label: 'All', value: '', key: '' },
    getParams: () => ({} as T),
    changeCallBack: null,
    ...opt,
  };

  const searchOptions = computed(() => {
    // const list = formData.value.areaType !== '' ? areaNameDictByType.value : areaNameDict.value;
    //

    const list = unShiftOptions(dict.value, [options.allOption]) as DefaultSelectOption[];
    // console.log(`searchOptions --> ${type} : `, type, list);
    return list;
  });

  const refresh = async (params: T = {} as T) => {
    console.log(`refresh --> ${type} : `, type, params, dict.value);
    console.log(
      JSON.stringify(params) === dictInitParamsBackUp.value,
      `dictInitParamsBackUp.value --> ${type} : `,
      type,
      dictInitParamsBackUp.value,
      dictInitBackUp.value,
    );
    if (JSON.stringify(params) === dictInitParamsBackUp.value) {
      dict.value = dictInitBackUp.value;
      return dict.value;
    }
    const res = (await getDictData(params)) as DynamicsDictDataInterface[DynamicsDictType];
    // console.log(`getDictData --> ${type} 原始数据:`, res);
    dict.value = transformDictData(res, dictDynamicsMapJson[type]) as DefaultSelectOption[];
    // 只保存第一次 初始化 字典 数据
    if (!dictInitParamsBackUp.value) {
      dictInitParamsBackUp.value = JSON.stringify(params);
      dictInitBackUp.value = dict.value;
    }
    // console.log(`dict.value --> ${type} : `, type, dict.value);
    return dict.value;
  };
  // 获取 字典 数据
  const getDictData = async (params: T): Promise<DynamicsDictDataInterface[DynamicsDictType]> => {
    return getDynamicsDictByAPI[type](params as any);
  };
  // 获取当前选项
  const currentOption = (value: string | number) => {
    return getCurrentOption(value, dict.value);
  };
  // 获取当前选项的label
  const currentOptionLabelOf = (value: string | number) => {
    return currentOption(value)?.label;
  };
  const changeSelect = (val: string | number, context: any) => {
    const opt = context?.option as any;
    const rawKey = opt?.key ?? (dict.value as any[])?.find((o: any) => o.value === val)?.key ?? '';
    const key = typeof rawKey === 'string' ? Number(rawKey) : rawKey;
    refresh(options.getParams());
    // 回调
    options.changeCallBack && options.changeCallBack(val, key || options.allOption.key);
  };
  // 刷新 字典
  refresh(options.getParams());
  return {
    dict,
    allOption: options.allOption,
    searchOptions,
    changeSelect,
    refresh,
    appendOptions,
    unShiftOptions,
    currentOption,
    currentOptionLabelOf,
  };
};
