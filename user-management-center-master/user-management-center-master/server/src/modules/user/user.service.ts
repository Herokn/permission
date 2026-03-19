import { Injectable } from '@nestjs/common'

type User = {
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
let seq = 3
const users: User[] = [
  { id: 1, name: 'Alice', full_name: 'Alice', email: 'alice@example.com', phone_no: '13800000001', employee_id: 'A001', gender: 'female', status: 'Y', company: 'WB', department: 'IT', title: 'Engineer', belong_team: 1, country: 'CN', role: 'admin' },
  { id: 2, name: 'Bob', full_name: 'Bob', email: 'bob@example.com', phone_no: '13800000002', employee_id: 'B002', gender: 'male', status: 'Y', company: 'WB', department: 'Finance', title: 'Analyst', belong_team: 2, country: 'CN', role: 'user' },
  { id: 3, name: 'Charlie', full_name: 'Charlie', email: 'charlie@example.com', phone_no: '13800000003', employee_id: 'C003', gender: 'male', status: 'Y', company: 'WB', department: 'HR', title: 'HR', belong_team: 1, country: 'CN', role: 'user' },
]

@Injectable()
export class UserService {
  list() {
    return users
  }
  get(id: number) {
    return users.find((u) => u.id === id)
  }
  create(payload: Partial<User>) {
    const u: User = {
      id: ++seq,
      name: payload.name || 'new',
      full_name: payload.full_name || '',
      password: payload.password || '',
      employee_id: payload.employee_id || '',
      email: payload.email || '',
      phone_no: payload.phone_no || '',
      gender: payload.gender || '',
      status: payload.status || 'Y',
      company: payload.company || '',
      department: payload.department || '',
      title: payload.title || '',
      belong_team: payload.belong_team ?? 1,
      idcard: payload.idcard || '',
      country: payload.country || '',
      init_password: payload.init_password ?? 0,
      update_password_date: payload.update_password_date ?? '',
      reset_password_day: payload.reset_password_day ?? 0,
      hiredate: payload.hiredate ?? '',
      dept_id: payload.dept_id ?? null,
      title_id: payload.title_id ?? null,
      role: payload.role || 'user',
    }
    users.push(u)
    return u
  }
  update(id: number, payload: Partial<User>) {
    const idx = users.findIndex((u) => u.id === id)
    if (idx < 0) return null
    users[idx] = { ...users[idx], ...payload, id }
    return users[idx]
  }
  remove(id: number) {
    const idx = users.findIndex((u) => u.id === id)
    if (idx < 0) return false
    users.splice(idx, 1)
    return true
  }
}
