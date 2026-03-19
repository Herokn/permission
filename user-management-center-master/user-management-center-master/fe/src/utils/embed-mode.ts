/**
 * Embed mode management utility
 * Handles scenarios when the system is embedded in other platforms
 */

const STORAGE_KEY = {
  // Whether from embed scenario
  IS_EMBED_MODE: 'is_embed_mode',
  // Authentication token
  AUTH_TOKEN: 'auth_token',
  // Original target route (from URL parameters)
  TARGET_ROUTE: 'target_route',
  // User type for auto-fill (domestic/overseas/external)
  USER_TYPE: 'user_type',
}

/**
 * Embed mode manager
 */
export class EmbedModeManager {
  /**
   * Mark current session as embed mode
   */
  static markAsEmbedMode(): void {
    localStorage.setItem(STORAGE_KEY.IS_EMBED_MODE, 'true')
  }

  /**
   * Check if current session is in embed mode
   */
  static isEmbedMode(): boolean {
    return localStorage.getItem(STORAGE_KEY.IS_EMBED_MODE) === 'true'
  }

  /**
   * Clear embed mode flag
   */
  static clearEmbedMode(): void {
    localStorage.removeItem(STORAGE_KEY.IS_EMBED_MODE)
  }

  /**
   * Save token to localStorage
   */
  static saveToken(token: string): void {
    if (!token) {
      console.warn('[EmbedMode] Token is empty')
      return
    }
    localStorage.setItem(STORAGE_KEY.AUTH_TOKEN, token)
  }

  /**
   * Get token from localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY.AUTH_TOKEN)
  }

  /**
   * Clear token from localStorage
   */
  static clearToken(): void {
    localStorage.removeItem(STORAGE_KEY.AUTH_TOKEN)
  }

  /**
   * Save target route
   */
  static saveTargetRoute(route: string): void {
    if (route) {
      localStorage.setItem(STORAGE_KEY.TARGET_ROUTE, route)
    }
  }

  /**
   * Get target route
   */
  static getTargetRoute(): string | null {
    return localStorage.getItem(STORAGE_KEY.TARGET_ROUTE)
  }

  /**
   * Clear target route
   */
  static clearTargetRoute(): void {
    localStorage.removeItem(STORAGE_KEY.TARGET_ROUTE)
  }

  /**
   * Save user type (domestic/overseas/external)
   */
  static saveUserType(userType: string): void {
    if (userType) {
      localStorage.setItem(STORAGE_KEY.USER_TYPE, userType)
    }
  }

  /**
   * Get user type
   */
  static getUserType(): string | null {
    return localStorage.getItem(STORAGE_KEY.USER_TYPE)
  }

  /**
   * Clear user type
   */
  static clearUserType(): void {
    localStorage.removeItem(STORAGE_KEY.USER_TYPE)
  }

  /**
   * Clear all embed mode related data
   * Call this when redirecting to login page
   * Note: userType is preserved for re-login scenarios
   */
  static clearAllData(): void {
    this.clearToken()
    this.clearTargetRoute()
    // 保留 userType，因为外部系统重新跳转时会带上，或者用户重新登录后继续操作
    // this.clearUserType()
    console.log('[EmbedMode] Session data cleared (userType preserved)')
  }

  /**
   * Redirect to embed login page (parent system login)
   * serviceUrl will be the current page URL, so user returns to the same page after login
   */
  static redirectToEmbedLogin(): void {
    // 获取当前页面地址作为 serviceUrl，登录后返回到当前页面
    const currentUrl = window.location.href
    const encodedServiceUrl = encodeURIComponent(currentUrl)
    const embedLoginUrl = `https://wbs.wanbridge.com/`

    console.log('[EmbedMode] Redirecting to embed login:', embedLoginUrl)

    // Clear all session data (keep embed mode flag, user will return after login)
    this.clearAllData()

    // Redirect to parent system login
    window.location.href = embedLoginUrl
  }

  /**
   * Redirect to standalone login page
   */
  static redirectToStandaloneLogin(): void {
    // Determine login URL based on environment
    const env = import.meta.env.MODE || 'development'
    const standaloneLoginUrl =
      env === 'production'
        ? 'https://ones.lvshiwanyang.com/login' // Production environment
        : 'https://ones.wbm3.com/mf-shell/login' // Test/Development environment

    console.log(
      '[EmbedMode] Redirecting to standalone login:',
      standaloneLoginUrl,
      `(env: ${env})`
    )

    // Clear all session data and embed mode flag
    this.clearAllData()
    this.clearEmbedMode()

    // Redirect to standalone system login
    window.location.href = standaloneLoginUrl
  }

  /**
   * Handle 401/4001 unauthorized errors
   * Redirect to different login pages based on embed mode
   */
  static handleUnauthorized(): void {
    if (this.isEmbedMode()) {
      // Embed mode: redirect to parent system login
      this.redirectToEmbedLogin()
    } else {
      // Standalone mode: redirect to standalone login
      this.redirectToStandaloneLogin()
    }
  }

  /**
   * Extract token parameter from URL
   */
  static extractTokenFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('token')
  }

  /**
   * Extract target route parameter from URL
   */
  static extractTargetRouteFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('redirect') || urlParams.get('targetRoute') || '/'
  }

  /**
   * Extract user type parameter from URL
   * Used for auto-fill when adding users (domestic/overseas/external)
   */
  static extractUserTypeFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('userType')
  }

  /**
   * Clean sensitive parameters (token, userType) from URL
   * Prevent token leakage in browser history
   */
  static cleanUrlParams(): void {
    const url = new URL(window.location.href)

    // Remove token parameter if exists
    if (url.searchParams.has('token')) {
      url.searchParams.delete('token')
    }
    // Remove userType parameter if exists (已保存到 localStorage)
    if (url.searchParams.has('userType')) {
      url.searchParams.delete('userType')
    }

    // Use replaceState to update history without page refresh
    window.history.replaceState({}, '', url.toString())
    console.log('[EmbedMode] Sensitive parameters cleaned from URL')
  }

  /**
   * Complete initialization process
   * Extract token from URL, save to localStorage, and clean URL parameters
   */
  static initialize(): {
    hasToken: boolean
    targetRoute: string
    userType: string | null
  } {
    console.log('[EmbedMode] initialize() called, URL:', window.location.href)

    const token = this.extractTokenFromUrl()
    const targetRoute = this.extractTargetRouteFromUrl()
    const userType = this.extractUserTypeFromUrl()

    console.log(
      '[EmbedMode] Extracted - token:',
      !!token,
      'targetRoute:',
      targetRoute,
      'userType:',
      userType
    )

    if (token) {
      // Token exists, entering embed mode
      console.log('[EmbedMode] Token detected, entering embed mode')
      this.markAsEmbedMode()
      this.saveToken(token)
      this.saveTargetRoute(targetRoute)

      // Save userType if exists
      if (userType) {
        this.saveUserType(userType)
        console.log('[EmbedMode] UserType saved to localStorage:', userType)
      }

      // Clean token from URL immediately to prevent leakage
      this.cleanUrlParams()

      return { hasToken: true, targetRoute, userType }
    }

    return { hasToken: false, targetRoute: '/', userType: null }
  }
}

// Export convenience methods
export const isEmbedMode = () => EmbedModeManager.isEmbedMode()
export const handleUnauthorized = () => EmbedModeManager.handleUnauthorized()
export const getAuthToken = () => EmbedModeManager.getToken()
