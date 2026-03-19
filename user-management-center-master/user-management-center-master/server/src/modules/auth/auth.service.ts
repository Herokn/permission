import { Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'

@Injectable()
export class AuthService {
  login(_payload: { username: string; password: string }) {
    const token = randomBytes(8).toString('hex')
    return { token }
  }
  logout() { return { ok: true } }
}
