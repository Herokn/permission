// 默认 字典选择 参数 声明
export interface DefaultSelectOption<T = any> {
  value: T;
  label: string;
  theme?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}
// 默认 分页 参数 声明
export interface DefaultPaginationOptions {
  pageNum?: number;
  pageSize?: number;
  total?: number;
}
