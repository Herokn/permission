import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { AuthService } from '../../modules/auth/auth.service.js'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<any>()
    
    // 1. 获取 Authorization 头
    const authHeader = req.headers?.authorization || ''
    
    // 2. 校验是否存在
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization Header')
    }

    // 3. 解析 Token
    const [type, token] = authHeader.split(' ')
    if (type !== 'Bearer' || !token) {
       throw new UnauthorizedException('Invalid Token Format (Expected Bearer <token>)')
    }
    
    // 4. 开发/Mock 模式后门 (可选，方便本地调试)
    if (token === 'mock_token') {
      req.user = { username: 'mock_user', roles: ['admin'] }
      return true
    }

    // 5. 调用 AuthService 进行远程校验 (Token Introspection / UserInfo)
    try {
      // 假设 AuthService 有一个 validateToken 方法
      // 如果 SSO 提供 /check_token 或 /userinfo 接口，可以在这里调用
      const userInfo = await this.authService.validateToken(token)
      if (!userInfo) {
        throw new UnauthorizedException('Invalid Token')
      }
      
      // 6. 将用户信息挂载到 Request 对象，供后续 Controller/Middleware 使用
      req.user = userInfo
      return true
    } catch (e) {
      console.error('Token validation failed:', e)
      throw new UnauthorizedException('Token Validation Failed')
    }
  }
}
