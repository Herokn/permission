export const Status = { Ok: 0, Error: 1, Unauth: 401, Forbidden: 403, NotFound: 404 } as const
export type ApiResult<T = any> = { code: number; msg?: string; data?: T }
export type Item = { id: number; name: string }
export type User = {
  id: number
  uuid?: string
  name: string
  full_name?: string
  password?: string
  employee_id?: string
  email: string
  phone_no?: string
  gender?: string
  status?: string
  company?: string
  department?: string
  title?: string
  belong_team?: number
  idcard?: string
  country?: string
  init_password?: number
  update_password_date?: string
  reset_password_day?: number
  hiredate?: string
  dept_id?: number | null
  title_id?: number | null
  role: string
}
