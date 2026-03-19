import type { MockMethod } from 'vite-plugin-mock'

let seq = 3
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' },
]

export default [
  { url: '/api/user/list', method: 'get', response: () => ({ code: 0, data: users }) },
  { url: '/api/user/:id', method: 'get', response: ({ query, params }) => ({ code: 0, data: users.find((u) => u.id === Number(params.id)) || null }) },
  { url: '/api/user', method: 'post', response: ({ body }) => { const u = { id: ++seq, ...body }; users.push(u); return { code: 0, data: u } } },
  { url: '/api/user/:id', method: 'put', response: ({ body, params }) => { const id = Number(params.id); const idx = users.findIndex((u) => u.id === id); if (idx < 0) return { code: 1, msg: 'not found' }; users[idx] = { ...users[idx], ...body, id }; return { code: 0, data: users[idx] } } },
  { url: '/api/user/:id', method: 'delete', response: ({ params }) => { const id = Number(params.id); const idx = users.findIndex((u) => u.id === id); const ok = idx >= 0; if (ok) users.splice(idx, 1); return { code: 0, data: ok } } },
] as MockMethod[]
