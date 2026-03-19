import { SelectProps } from 'tdesign-vue-next';

export const useSelectMethod = () => {
  // 配合 select filter属性
  const filterMethod: SelectProps['filter'] = (search, option) => {
    // 全部 小写，去空格
    const keyword = search ? `${search}`.toLowerCase().replace(/\s+/g, '') : '';
    if (!option.label) {
      return false;
    }
    const label = option?.label ? option.label.toLowerCase().replace(/\s+/g, '') : '';
    return label.toLowerCase().includes(keyword);
  };
  return {
    filterMethod,
  };
};
