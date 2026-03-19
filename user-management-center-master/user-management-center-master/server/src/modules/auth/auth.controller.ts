import { Controller, Post, Body, Get, Req, Res } from '@nestjs/common'
import { randomBytes } from 'crypto'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { HttpService } from '../../core/http/http.service.js'
import { LoginDto } from './dto/login.dto.js'

@Controller('api/auth')
export class AuthController {
  constructor(private readonly http: HttpService) {}
  @Post('login')
  login(@Body() payload: LoginDto) {
    const token = randomBytes(8).toString('hex')
    return { token }
  }
  @Post('logout')
  logout() {
    return { ok: true }
  }
  @Get('echo')
  echo(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return reply.send({ headers: req.headers })
  }
  @Get('external')
  async external() {
    const port = Number(process.env.PORT || 4120)
    const data = await this.http.request(`http://127.0.0.1:${port}/api/health`)
    return data
  }
}
