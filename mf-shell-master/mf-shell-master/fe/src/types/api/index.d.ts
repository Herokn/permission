// 分页查询 通用参数
export interface QueryListParams {
  pageNum?: number; // 页码，默认1
  pageSize?: number; // 每页数量，默认10
}

// 返回值 声明
// 通用 -- api 接口 结构声明
export interface APIResultLayout<T = Record<string, any>> {
  success?: boolean;
  code: number; // 200 表示成功
  message: string;
  data?: T;
}
// 通用 -- list 结构声明
export interface APIListResultLayout<T> {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPage:number;
  isMore:number;
  size: number;
  startIndex:number
  list: T[];
}
