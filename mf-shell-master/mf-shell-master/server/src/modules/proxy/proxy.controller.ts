import { Controller, All, Req, Res, UseGuards, Param } from '@nestjs/common'
import { ProxyService } from './proxy.service.js'
import { AuthGuard } from '../../common/guards/auth.guard.js'

@Controller('api/proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All(':target/*')
  @UseGuards(AuthGuard)
  async proxy(@Param('target') target: string, @Req() req: any, @Res() res: any) {
    // target 可以是预定义的子应用标识，如 'app1', 'user-center' 等
    // 也可以根据配置映射到实际的后端服务地址
    await this.proxyService.forward(target, req, res)
  }
}
