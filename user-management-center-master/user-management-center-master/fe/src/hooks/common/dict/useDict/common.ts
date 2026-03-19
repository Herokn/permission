import { DefaultSelectOption } from '@/types/commonDefault';

/** ************* hook 开始 ************* */

// 转换 字典 数据 函数
/**
 * @description: 转换 字典 数据 函数
 * @param {DictDataInterface} dictData 字典 数据
 * @param {Record<string, string>} mapJson 映射 数据 key 是目标对象 的 key, value 数据源的 key
 * @return {any[]}
 */
export const transformDictData = (
  dictData: any[],
  mapJson: Record<string, string> = { label: 'label', value: 'value' },
) => {
  if (!dictData) {
    return [];
  }

  return dictData.map((itemVal: Record<string, any>) => {
    const isObject = typeof itemVal === 'object';
    const item = { sourceData: isObject ? itemVal : null } as Record<string, any | null>;
    Object.keys(mapJson).forEach((key) => {
      if (isObject && mapJson[key] !== undefined && itemVal[mapJson[key]] !== undefined) {
        item[key] = itemVal[mapJson[key]];
      } else {
        item[key] = itemVal;
      }
    });
    return item;
  });
};

// 追加 all 选项
export const appendOptions = (dictData: DefaultSelectOption[], options = [] as DefaultSelectOption[]) => {
  if (!dictData) {
    return [];
  }
  return [...dictData, ...options];
};
// 前置 追加
export const unShiftOptions = (dictData: DefaultSelectOption[], options = [] as DefaultSelectOption[]) => {
  if (!dictData) {
    return [];
  }
  return [...options, ...dictData];
};

// 获取当前选项
export const getCurrentOption = (value: string | number, list: DefaultSelectOption[] = []) => {
  return list.find((item) => item.value === value);
};

// 获取当前全部选项
export const getCurrentAllOptions = (valueList: DefaultSelectOption['value'][], list: DefaultSelectOption[] = []) => {
  return list.filter((item) => valueList.includes(item.value as never as string | number));
};
