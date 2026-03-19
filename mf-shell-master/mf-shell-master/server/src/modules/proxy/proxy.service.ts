import { Injectable, NotFoundException } from '@nestjs/common'
import fastProxy from 'fast-proxy'

@Injectable()
export class ProxyService {
  private readonly proxy: any
  private readonly routes: Record<string, string> = {
    // 示例配置：将 'user-center' 映射到后端服务
    'user-center': 'http://localhost:8086', 
    // 可以添加更多子应用映射
    // 'app1': 'http://app1-service:3000'
  }

  constructor() {
    // 初始化 fast-proxy
    this.proxy = fastProxy({
      base: '', // 动态设置
    })
  }

  async forward(target: string, req: any, res: any) {
    const upstream = this.routes[target]
    if (!upstream) {
      throw new NotFoundException(`Proxy target '${target}' not found`)
    }

    // 重写 URL：去掉 /api/proxy/target 前缀
    // 原始 URL: /api/proxy/user-center/v1/users
    // 目标 URL: http://localhost:8086/v1/users
    const prefix = `/api/proxy/${target}`
    const rewrite = (path: string) => path.replace(prefix, '') || '/'

    this.proxy.proxy(req, res, upstream, {
      rewrite,
      // 可以在这里注入用户信息到 Header
      onBeforeRequest: (proxyReq: any) => {
        if (req.user) {
          proxyReq.headers['x-user-id'] = req.user.username
          // proxyReq.headers['x-user-roles'] = JSON.stringify(req.user.roles)
        }
      }
    })
  }
}
