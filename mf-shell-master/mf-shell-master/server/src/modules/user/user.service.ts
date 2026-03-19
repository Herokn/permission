import { Injectable } from '@nestjs/common'

type User = { id: number; name: string; email: string; role: string }
let seq = 3
const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' },
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
    const u: User = { id: ++seq, name: payload.name || 'new', email: payload.email || '', role: payload.role || 'user' }
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
