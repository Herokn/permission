import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '../../core/http/http.service.js'

type LoginPayload = { username: string; password: string }
type PermissionSession = {
  token: string
  userId: string
  username: string
  cookieHeader: string
}

@Injectable()
export class AuthService {
  // SSO 配置
  private readonly ssoBaseUrl: string
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly redirectUri: string
  private readonly permissionBaseUrl: string
  private readonly permissionCenterUrl: string
  private readonly userManagementUrl: string
  private readonly defaultProjectId: string
  private readonly usePermissionLogin: boolean
  private readonly systemPermissionMap: Record<string, string>
  private readonly permissionSessions = new Map<string, PermissionSession>()

  constructor(
    @Inject(HttpService)
    private readonly http: HttpService,
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {
    // 优先使用 ConfigService，如果注入失败则回退到 process.env
    const getEnv = (key: string, defaultValue?: string): string => {
      if (this.configService) {
        const value = this.configService.get<string>(key)
        if (value) return value
      }
      return process.env[key] || defaultValue || ''
    }

    // 从环境变量读取配置
    this.ssoBaseUrl = getEnv('SSO_BASE_URL')
    this.clientId = getEnv('SSO_CLIENT_ID')
    this.clientSecret = getEnv('SSO_CLIENT_SECRET')
    this.redirectUri = getEnv('SSO_REDIRECT_URI')
    this.permissionBaseUrl = getEnv(
      'PERMISSION_BASE_URL',
      'http://localhost:8080/api'
    )
    this.permissionCenterUrl = getEnv(
      'PERMISSION_CENTER_URL',
      'http://localhost:3000/'
    )
    this.userManagementUrl = getEnv(
      'USER_MANAGEMENT_URL',
      'http://localhost:3032/users/'
    )
    this.defaultProjectId = getEnv('DEFAULT_PROJECT_ID', 'P1')
    this.usePermissionLogin = getEnv('USE_PERMISSION_LOGIN', '1') === '1'
    this.systemPermissionMap = {
      'user-management': getEnv(
        'PERM_CODE_USER_MANAGEMENT',
        'SYS_USER_MANAGEMENT_ACCESS'
      ),
      'permission-center': getEnv(
        'PERM_CODE_PERMISSION_CENTER',
        'SYS_PERMISSION_CENTER_ACCESS'
      ),
    }

    // 验证必填配置
    const missingConfigs: string[] = []
    if (!this.clientId) missingConfigs.push('SSO_CLIENT_ID')
    if (!this.clientSecret) missingConfigs.push('SSO_CLIENT_SECRET')
    if (!this.redirectUri) missingConfigs.push('SSO_REDIRECT_URI')

    if (missingConfigs.length > 0) {
      throw new Error(
        `SSO 配置缺失！请检查环境变量: ${missingConfigs.join(', ')}`
      )
    }

    // 打印配置信息（生产环境建议使用 Logger）
    console.log('========================================')
    console.log('SSO 配置已加载:')
    console.log('  环境: ', process.env.NODE_ENV || 'development')
    console.log('  SSO Base URL: ', this.ssoBaseUrl)
    console.log('  Client ID: ', this.clientId)
    console.log('  Redirect URI: ', this.redirectUri)
    console.log('========================================')
  }

  // 1. 授权 (获取授权地址) - 已被 ssoCheck 替代逻辑
  getAuthorizeUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: 'openid profile',
      state: Math.random().toString(36).substring(7),
    })
    return `${this.ssoBaseUrl}/oauth2/authorize?${params.toString()}`
  }

  // 1.5. SSO 状态检测 (供子应用/Shell 初始化使用)
  async ssoCheck() {
    try {
      // Step 1: 首次授权检测 (GET /oauth2/authorize)
      const state = Math.random().toString(36).substring(7)
      const authorizeParams = new URLSearchParams({
        client_id: this.clientId,
        response_type: 'code',
        redirect_uri: this.redirectUri,
        scope: 'openid profile',
        state,
      })
      const authorizeUrl = `${this.ssoBaseUrl}/oauth2/authorize?${authorizeParams.toString()}`

      console.log('SSO Check Start:', authorizeUrl)

      try {
        const authResp = await fetch(authorizeUrl)
        console.log('SSO Check Response Status:', authResp.status)

        // 尝试解析 JSON
        let authData: any = {}
        try {
          authData = await authResp.json()
          console.log('SSO Check Response Data:', authData)
        } catch {
          console.log('SSO Check Response is not JSON')
        }

        // 情况 A: 需要登录
        if (authData && authData.require_login === true) {
          let redirectUrl = authData.login_url
          if (redirectUrl && !redirectUrl.startsWith('http')) {
            const baseUrl = this.ssoBaseUrl.endsWith('/')
              ? this.ssoBaseUrl
              : `${this.ssoBaseUrl}/`
            const cleanPath = redirectUrl.startsWith('/')
              ? redirectUrl.slice(1)
              : redirectUrl
            redirectUrl = `${baseUrl}${cleanPath}`
          }
          return {
            code: 401,
            message: 'SSO Login Required',
            result: {
              redirectUrl,
              requireLogin: true,
            },
          }
        }

        // 情况 B: 已登录 (require_login: false) 或者 发生了 302 跳转 (说明已登录)
        // 如果是 302，fetch 默认会自动跟随，所以我们可能拿不到 302 状态码，而是最终页面的结果
        // 如果我们想捕获 302，需要设置 redirect: 'manual'

        // 为了稳健性，我们再发一次手动请求来捕获 302 (如果第一次不是 JSON)
        // 或者如果 authData.require_login === false，我们可以尝试获取 Code

        if (
          (authData && authData.require_login === false) ||
          authResp.status === 302 ||
          authResp.redirected
        ) {
          console.log('SSO Check: User is logged in, attempting to get Token')
          // 这里可以尝试执行 Step 3 (换 Code) -> Step 4 (换 Token)
          // 但注意：Step 3 需要 Cookie。
          // 这里的 fetch(authorizeUrl) 是不带 Cookie 的。
          // 如果 SSO 是基于 Cookie 的，那么 Node 端此时没有 Cookie，SSO 应该返回 require_login: true。
          // 除非：SSO 允许基于 IP 或其他方式的隐式登录。

          // 如果 Node 端没有 Cookie，通常 SSO 都会要求登录。
          // 子应用调用 ssoCheck 的主要目的是：获取跳转地址，或者确认是否需要在前端发起跳转。

          // 如果 Node 端无法代表用户（无 Cookie），那么 Node 端看到的永远是 "未登录"。
          // 除非：前端把浏览器 Cookie 传给 Node。
          // 但前面我们讨论过，Node 代理模式下，浏览器不存 SSO Cookie。

          // 所以，ssoCheck 对于 Node 代理架构来说，主要作用是：
          // 获取 SSO 的登录地址 (login_url)。

          // 如果 Node 端持有 Token (例如在内存/Redis中)，可以直接返回已登录。
          // 但这是无状态 API。

          // 结论：对于 ssoCheck，如果 Node 没有上下文，它只能返回 "去登录"。
          // 除非我们利用 Step 3 的逻辑：如果 Step 1 返回了 require_login: false，说明 SSO 认为无需登录即可授权 (极少见，除非是 Client Credentials 模式或 IP 白名单)。

          // 假设 SSO 返回了 false，我们尝试获取 Code
          // 这里复用 Step 3 逻辑
          // 但 Step 3 依赖 Step 2 返回的 Cookie。

          // 简而言之：如果 ssoCheck 返回 require_login: false，我们尝试走一遍 Step 3。
          // 如果成功拿到重定向 Code，就继续。

          // 暂时简单处理：如果 require_login: false，返回 success
          return {
            code: 200,
            message: 'SSO Logged In',
            result: {
              requireLogin: false,
            },
          }
        }

        // 默认情况：视为需要登录
        return {
          code: 401,
          message: 'SSO Check Failed (Default)',
          result: { requireLogin: true },
        }
      } catch (e) {
        console.warn('SSO Check request failed:', e)
        return { code: 500, message: 'SSO Check Error' }
      }
    } catch (e: any) {
      console.error('SSO Check Error:', e)
      return { code: 500, message: e.message || 'SSO Check Failed' }
    }
  }

  // 2. 登录 (SSO 登录接口)
  async ssoLogin(payload: LoginPayload) {
    try {
      console.log('SSO Login Start:', {
        username: payload.username,
        redirectUri: this.redirectUri,
      })

      // Step 1: 准备授权 URL (作为 Step 3 的回退地址)
      const authorizeUrl = this.buildAuthorizeUrl()

      // Step 2: 登录 (POST /api/v1/sso/login)
      const step2Result = await this.performLogin(payload)
      if (!step2Result.success) {
        return {
          code: 401,
          message: 'SSO Login Failed',
          result: step2Result.data,
        }
      }

      // 提取 Step 2 返回的 Session ID (Cookie) 和重定向地址
      const ssoSessionId = step2Result.sessionId || ''
      // 如果 Step 2 返回了 redirectUrl，则使用它；否则回退到初始构建的 authorizeUrl
      const finalAuthorizeUrl = step2Result.redirectUrl || authorizeUrl

      // Step 3: 再次授权 (GET /oauth2/authorize)
      const step3Result = await this.performAuthorizeCheck(
        finalAuthorizeUrl,
        ssoSessionId
      )

      // Step 4: 处理重定向或返回 Code
      if (step3Result.code) {
        console.log('Step 4: Extracted Code:', step3Result.code)
        // 自动执行 Step 4: Code 换 Token
        return await this.getToken(
          step3Result.code,
          ssoSessionId,
          payload.username
        )
      }

      // 如果没有拿到 Code，但有跳转地址
      if (step3Result.redirectUrl) {
        return {
          code: 200,
          message: 'SSO Login Redirected (No Code Found)',
          result: {
            redirectUrl: step3Result.redirectUrl,
            ssoSessionId, // 即使跳转也带上 SessionID (虽然可能用不上)
          },
        }
      }

      return { code: 401, message: 'SSO Login Failed (No Code or Redirect)' }
    } catch (e: any) {
      console.error('SSO Login Error:', e)
      return { code: 500, message: e.message || 'SSO Login Error' }
    }
  }

  // --- Private Helpers ---

  private buildAuthorizeUrl(state = Math.random().toString(36).substring(7)) {
    const authorizeParams = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: 'openid profile',
      state,
    })
    return `${this.ssoBaseUrl}/oauth2/authorize?${authorizeParams.toString()}`
  }

  // Step 2: 执行登录请求
  private async performLogin(payload: LoginPayload) {
    const loginUrl = `${this.ssoBaseUrl}/api/v1/sso/login`
    const state = Math.random().toString(36).substring(7)
    const loginBody = {
      username: payload.username,
      password: payload.password,
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      scope: 'openid profile',
      state,
      rememberMe: true,
    }

    console.log('Step 2: Login Request:', loginUrl, {
      ...loginBody,
      password: '***',
    })

    const loginResp = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginBody),
    })

    console.log('Step 2: Login Response Status:', loginResp.status)

    // 解析 Cookie
    const setCookie = loginResp.headers.get('set-cookie')
    let sessionId = ''
    if (setCookie) {
      console.log('Step 2: Login Response Set-Cookie:', setCookie)
      const match = setCookie.match(/SSO_SESSION_ID=([^;]+)/)
      if (match) sessionId = match[1]
    } else {
      console.warn('Step 2: Login Response missing Set-Cookie')
    }

    // 解析响应体
    let data: any = {}
    try {
      data = await loginResp.json()
    } catch {
      // ignore
    }

    // 统一成功判断逻辑：状态码 200 且 (data.success 为 true 或 data.code 为 200)
    // 注意：有的接口可能只返回 success: true，有的可能返回 code: 200
    const isSuccess =
      loginResp.ok &&
      (data.success === true || data.code === 200 || loginResp.status === 200)

    if (!isSuccess) {
      console.warn('Step 2: Login Failed', data)
      return { success: false, data }
    }

    // 提取 redirectUrl
    let redirectUrl = ''
    if (data && data.redirectUrl) {
      redirectUrl = data.redirectUrl
      // 如果是相对路径，拼接 SSO Base URL
      if (redirectUrl && !redirectUrl.startsWith('http')) {
        const baseUrl = this.ssoBaseUrl.endsWith('/')
          ? this.ssoBaseUrl
          : `${this.ssoBaseUrl}/`
        const cleanPath = redirectUrl.startsWith('/')
          ? redirectUrl.slice(1)
          : redirectUrl
        redirectUrl = `${baseUrl}${cleanPath}`
      }
      console.log('Step 2: Extracted redirectUrl for Step 3:', redirectUrl)
    }

    return { success: true, sessionId, redirectUrl, data }
  }

  // Step 3: 执行再次授权检查
  private async performAuthorizeCheck(url: string, sessionId: string) {
    console.log(
      'Step 3: Final Authorize Request:',
      url,
      'Cookie:',
      sessionId ? `SSO_SESSION_ID=***` : 'None'
    )

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Cookie: sessionId ? `SSO_SESSION_ID=${sessionId}` : '',
      },
      redirect: 'manual',
    })

    console.log('Step 3: Final Authorize Response Status:', resp.status)

    // 检查是否重定向 (302/301)
    if (resp.status === 302 || resp.status === 301 || resp.redirected) {
      let location = resp.headers.get('location')
      if (!location && resp.redirected) location = resp.url

      console.log('Step 3: Redirect Location:', location)

      if (location) {
        // 尝试从 URL 中提取 Code
        try {
          const urlObj = new URL(location)
          const code = urlObj.searchParams.get('code')
          if (code) return { code, redirectUrl: location }
        } catch (e) {
          console.warn('Step 3: Failed to parse location URL', e)
        }
        return { redirectUrl: location }
      }
    }

    // 检查 JSON 响应
    let data: any = {}
    try {
      data = await resp.json()
      console.log('Step 3: Response Data:', data)
      // 兼容 JSON 直接返回 code 的情况
      if (
        data &&
        data.code &&
        typeof data.code === 'string' &&
        data.code.length > 10
      ) {
        // 这里假设 code 是 OAuth code，而不是状态码 200
        // 实际上最好检查字段名是否是 'oauth_code' 或者上下文
        // 根据之前的上下文，如果直接返回 JSON，code 字段就是 auth code
        return { code: data.code, data }
      }
    } catch {
      // ignore
    }

    return { data }
  }

  // 4. 获取 Token (通过 Code 换取 Token)
  async getToken(code: string, ssoSessionId?: string, loginUsername?: string) {
    const url = `${this.ssoBaseUrl}/oauth2/token`
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64'
    )
    console.log(
      'Get Token Request:',
      url,
      'code:',
      code,
      'loginUsername:',
      loginUsername
    )
    try {
      // 必须使用 application/x-www-form-urlencoded
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      })

      const resp = await this.http.post(url, body, {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      })
      console.log('Get Token Response:', resp)

      // 解析并标准化 Token 数据
      // 假设 resp 已经是解析后的 JSON 对象 (HttpService.post 通常返回响应体)
      // 如果 resp 是 AxiosResponse，则需要 resp.data
      // 根据你的 HttpService 实现，假设它返回的是 data

      const tokenData = resp

      // 检查是否包含 access_token
      if (tokenData && tokenData.access_token) {
        // 优先使用登录时传入的用户名，否则从 id_token 解析
        let username = loginUsername || ''
        if (!username && tokenData.id_token) {
          try {
            const parts = tokenData.id_token.split('.')
            if (parts.length === 3) {
              const payload = JSON.parse(
                Buffer.from(parts[1], 'base64').toString()
              )
              // 优先使用 preferred_username，其次 sub，最后 name
              username =
                payload.preferred_username || payload.sub || payload.name || ''
              console.log('Decoded username from id_token:', username)
            }
          } catch (e) {
            console.warn('Failed to decode id_token:', e)
          }
        } else if (username) {
          console.log('Using login username:', username)
        }

        // 标准化返回给前端 - 统一数据结构
        return {
          code: 2000,
          message: 'Login Success',
          success: true,
          data: {
            accessToken: tokenData.access_token,
            tokenType: tokenData.token_type || 'Bearer',
            expiresIn: tokenData.expires_in,
            refreshToken: tokenData.refresh_token,
            idToken: tokenData.id_token,
            scope: tokenData.scope,
            ssoSessionId: ssoSessionId || '', // 传递 SessionID 供前端存储
            username, // 返回用户名
          },
        }
      }

      // Token 数据格式异常
      return {
        code: 501,
        message: 'Invalid Token Response',
        success: false,
        data: null,
      }
    } catch (e: any) {
      console.error('SSO Get Token Error:', e)
      // 提取详细错误信息
      const errorDetail = e.response?.data || e.message
      console.error('SSO Get Token Error Detail:', errorDetail)
      return {
        code: 500,
        message: 'Get Token Failed',
        success: false,
        data: { detail: errorDetail },
      }
    }
  }

  // 5. 登出
  async logout(ssoSessionId?: string, wbAccessToken?: string) {
    const localToken = this.normalizeBearerToken(wbAccessToken || '')
    if (localToken && this.permissionSessions.has(localToken)) {
      const session = this.permissionSessions.get(localToken)!
      try {
        await fetch(`${this.permissionBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            Cookie: session.cookieHeader,
          },
        })
      } catch {}
      this.permissionSessions.delete(localToken)
      return {
        success: true,
        clearStorage: true,
      }
    }
    const url = `${this.ssoBaseUrl}/api/v1/sso/logout`
    console.log(
      'Logout Request:',
      url,
      'SessionId:',
      ssoSessionId ? '***' : 'None',
      'WB-Access-Token:',
      wbAccessToken ? '***' : 'None'
    )
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (ssoSessionId) {
        headers['Cookie'] = `SSO_SESSION_ID=${ssoSessionId}`
      }
      if (wbAccessToken) {
        headers['WB-Access-Token'] = wbAccessToken
      }

      const body = {
        postLogoutRedirectUri: this.redirectUri,
      }

      console.log('Logout Payload:', body)

      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      console.log('Logout Response', resp)

      let data: any = {}
      try {
        data = await resp.json()
        console.log('Logout Response Data:', data)
      } catch {
        console.log('Logout Response is not JSON')
      }

      if (!resp.ok) {
        console.warn('Logout Failed:', data)
        // 即使后端登出失败，前端也应该认为登出成功（清除本地 Token）
        return {
          success: false,
          message: 'SSO Logout Failed',
          clearStorage: true, // 提示前端清除 localStorage
          data,
        }
      }

      return {
        success: true,
        clearStorage: true, // 提示前端清除 localStorage
        data,
      }
    } catch (e: any) {
      console.error('SSO Logout Error:', e)
      return {
        code: 500,
        message: 'Logout Failed',
        clearStorage: true, // 即使出错也要清除前端存储
      }
    }
  }

  // 验证 Token (调用 SSO /check_token 或 /userinfo)
  async validateToken(token: string) {
    // 假设 SSO 提供 /oauth2/userinfo 或 /api/v1/token/check 接口
    // 这里使用 /oauth2/userinfo (OIDC 标准) 作为示例
    const url = `${this.ssoBaseUrl}/oauth2/userinfo`
    try {
      // 如果 token 是 JWT 且本地有公钥，也可以本地校验
      // 这里采用远程校验方式
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (resp.status === 200) {
        return await resp.json()
      }

      // 兼容性：如果上述失败，尝试另一种常见的 introspection 接口
      // const checkUrl = `${this.ssoBaseUrl}/oauth2/check_token` ...

      console.warn('Validate Token failed, status:', resp.status)
      return null
    } catch (e) {
      console.error('Validate Token Error:', e)
      return null
    }
  }

  private normalizeBearerToken(authorization = '') {
    return authorization.replace(/^Bearer\s+/i, '').trim()
  }

  private generateLocalToken(username: string) {
    const raw = `${username}:${Date.now()}:${Math.random().toString(36).slice(2)}`
    return Buffer.from(raw).toString('base64url')
  }

  private extractCookieHeader(resp: Response) {
    const headersAny = resp.headers as any
    const cookieLines: string[] =
      headersAny?.getSetCookie?.() || (resp.headers.get('set-cookie') ? [resp.headers.get('set-cookie') as string] : [])
    return cookieLines
      .map((line) => line.split(';')[0]?.trim())
      .filter(Boolean)
      .join('; ')
  }

  private async loginToPermissionCenter(payload: LoginPayload) {
    const loginResp = await fetch(`${this.permissionBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: payload.username,
        password: payload.password,
      }),
    })
    const body = await loginResp.json().catch(() => ({}))
    const ok =
      loginResp.ok &&
      (body?.code === '200' || body?.code === 200 || body?.success === true)
    if (!ok) {
      return { ok: false, body, cookieHeader: '' }
    }
    const cookieHeader = this.extractCookieHeader(loginResp)
    return { ok: true, body, cookieHeader }
  }

  private createPermissionSession(
    userInfo: any,
    fallbackUsername: string,
    cookieHeader: string,
    projectId?: string
  ) {
    const username = userInfo?.userName || fallbackUsername
    const userId = userInfo?.userId || username
    const token = this.generateLocalToken(username)
    this.permissionSessions.set(token, {
      token,
      userId,
      username,
      cookieHeader,
    })
    return {
      code: 2000,
      message: 'Login Success',
      success: true,
      data: {
        accessToken: token,
        tokenType: 'Bearer',
        username,
        userId,
        projectId: projectId || this.defaultProjectId,
      },
    }
  }

  async loginByPermissionSession(cookieHeader = '', projectId?: string) {
    if (!cookieHeader) {
      return {
        code: 401,
        message: 'Permission login required',
        success: false,
      }
    }
    try {
      const userResp = await fetch(`${this.permissionBaseUrl}/auth/current-user`, {
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
        },
      })
      const userBody = await userResp.json().catch(() => ({}))
      const ok =
        userResp.ok &&
        (userBody?.code === '200' ||
          userBody?.code === 200 ||
          userBody?.success === true)
      if (!ok) {
        return {
          code: 401,
          message: 'Permission login required',
          success: false,
        }
      }
      const userInfo = userBody?.data || userBody?.result || {}
      const fallbackUsername = userInfo?.userName || 'permission_user'
      return this.createPermissionSession(
        userInfo,
        fallbackUsername,
        cookieHeader,
        projectId
      )
    } catch {
      return {
        code: 401,
        message: 'Permission login required',
        success: false,
      }
    }
  }

  async getSystems(authorization = '', projectId?: string) {
    const token = this.normalizeBearerToken(authorization)
    const session = this.permissionSessions.get(token)
    if (!session) {
      return { code: 401, message: 'Unauthorized', result: [] as any[] }
    }
    const targetProjectId = projectId || this.defaultProjectId
    const systems: any[] = [
      {
        mapUuid: 'permission-center',
        mapShowname: '权限控制中心',
        mapCode: 'permission-center',
        mapUrl: this.permissionCenterUrl,
        mapExternal: 'Y',
      },
    ]
    const userCenterPermission =
      this.systemPermissionMap['user-management'] || 'SYS_USER_MANAGEMENT_ACCESS'
    let canAccessUserCenter = false
    try {
      const resp = await fetch(`${this.permissionBaseUrl}/authz/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: session.cookieHeader,
        },
        body: JSON.stringify({
          userId: session.userId || session.username,
          permissionCode: userCenterPermission,
          projectId: targetProjectId,
        }),
      })
      const data = await resp.json().catch(() => ({}))
      canAccessUserCenter =
        data?.data?.allowed === true ||
        data?.result?.allowed === true ||
        data?.allowed === true
    } catch {
      canAccessUserCenter = false
    }
    if (canAccessUserCenter) {
      const userCenterUrl = new URL(this.userManagementUrl)
      userCenterUrl.searchParams.set('token', token)
      userCenterUrl.searchParams.set('hideMenu', 'true')
      systems.unshift({
        mapUuid: 'user-management',
        mapShowname: '用户管理中心',
        mapCode: 'user-management',
        mapUrl: userCenterUrl.toString(),
        mapExternal: 'Y',
      })
    }
    return {
      code: 200,
      message: 'ok',
      result: systems,
    }
  }

  getCurrentUserByToken(authorization = '') {
    const token = this.normalizeBearerToken(authorization)
    const session = this.permissionSessions.get(token)
    if (!session) return null
    return {
      username: session.username,
      userId: session.userId,
      roles: ['user'],
    }
  }

  async login(payload: LoginPayload) {
    if (this.usePermissionLogin) {
      const permissionLogin = await this.loginToPermissionCenter(payload)
      if (!permissionLogin.ok) {
        return {
          code: 401,
          message: permissionLogin.body?.message || 'Login Failed',
          success: false,
        }
      }
      const userInfo = permissionLogin.body?.data || permissionLogin.body?.result || {}
      return this.createPermissionSession(
        userInfo,
        payload.username,
        permissionLogin.cookieHeader,
        this.defaultProjectId
      )
    }
    return this.ssoLogin(payload)
  }
}
