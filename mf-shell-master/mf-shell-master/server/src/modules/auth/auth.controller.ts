import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Headers,
  Inject,
  Res,
} from '@nestjs/common'
import { AuthService } from './auth.service.js'

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly auth: AuthService
  ) {}

  // 获取 SSO 授权地址 (前端跳转用)
  @Get('sso/authorize')
  getAuthorizeUrl() {
    const url = this.auth.getAuthorizeUrl()
    return { code: 200, result: url }
  }

  // SSO 状态检查 (子应用调用)
  @Get('sso/check')
  async ssoCheck() {
    return this.auth.ssoCheck()
  }

  // 代理 SSO 登录 (前端输入账号密码方式)
  @Post('sso/login')
  async ssoLogin(
    @Body() payload: { username: string; password: string },
    @Res() res: any
  ) {
    const result = await this.auth.ssoLogin(payload)

    // 如果需要透传 Cookie 到前端 (例如前端需要直接与 SSO 交互)
    // 这里的 ssoSessionId 是如何获取的？
    // 目前 ssoLogin 方法返回的是 { code, message, result }
    // 如果我们想把 Cookie 种到前端，需要从 authService 中暴露出来

    // 但根据目前的设计，Node 端作为代理，Cookie 主要在 Node 端流转（Step 2 -> Step 3）
    // 除非前端后续需要直接请求 SSO 接口（不通过 Node 代理），否则前端不需要这个 Cookie。
    // 鉴于用户问 "java服务端会在这个接口把cookie种到往浏览器中吗"，通常 Java 接口 Set-Cookie 是种在响应头里的。
    // Node 端作为中间层，收到了这个 Set-Cookie。
    // 如果前端是浏览器 -> Node -> Java，那么 Java 的 Set-Cookie 是种在 Node 端的响应里的。
    // 如果 Node 不显式把这个 Set-Cookie 转发给前端，前端浏览器是收不到的。

    // 如果希望前端也有这个 Cookie (虽然在 Proxy 模式下可能不需要，但为了保险起见)
    // 我们可以在 AuthService 返回结果中包含 cookie 信息，或者直接在这里透传。
    // 但 AuthService.ssoLogin 目前返回结构比较固定。

    // 简单起见，我们直接返回 JSON 结果，让 Node 端完成所有鉴权流程。
    // 如果 ssoLogin 返回了重定向 (Step 4)，前端会跳转。

    // 使用 res.send 发送响应，适配 Fastify/Express
    return res.status(200).send(result)
  }

  // Code 换 Token
  @Get('sso/token')
  async getToken(@Query('code') code: string) {
    if (!code) return { code: 400, message: 'Code is required' }
    return this.auth.getToken(code)
  }

  @Post('login')
  async login(@Body() payload: { username: string; password: string }) {
    return this.auth.login(payload)
  }

  @Post('logout')
  async logout(
    @Body() body: { ssoSessionId?: string },
    @Headers('wb-access-token') wbAccessToken?: string
  ) {
    const result = await this.auth.logout(body.ssoSessionId, wbAccessToken)
    return { code: 200, result }
  }

  @Get('me')
  me(@Headers('authorization') authorization = '') {
    const token = authorization || ''
    // 这里需要扩展：如果 token 是 SSO 返回的 JWT，需要校验或解析
    // 暂时保留 mock 逻辑兼容
    if (token.includes('mock_token')) {
      return { code: 200, result: { username: 'admin', roles: ['all'] } }
    }
    // 如果是真实 Token，应该调用 SSO 或本地校验逻辑
    // 简单模拟: 只要有 token 就放行 (开发阶段)
    if (token) {
      return { code: 200, result: { username: 'sso_user', roles: ['user'] } }
    }
    return { code: 403, message: 'Unauthorized' }
  }
}
