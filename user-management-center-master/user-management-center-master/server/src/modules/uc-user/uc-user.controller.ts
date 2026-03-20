import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common'
import { UcUserService } from './uc-user.service.js'
import type { Request } from 'express'

function extractAuth(req: Request): string | undefined {
  const auth = req.headers.authorization
  if (auth) return auth
  const cookie = req.headers.cookie
  if (cookie) {
    const match = cookie.match(/access_token=([^;]+)/)
    if (match) return `Bearer ${match[1]}`
  }
  return undefined
}

    return this.svc.enableByIdGet(id, extractAuth(req))
  }

  @Post(':id/disable')
  disableRest(@Param('id') id: string, @Req() req: Request) {
    return this.svc.disableByIdGet(id, extractAuth(req))
  }

  @Post(':id/reset-password')
  resetPasswordRest(@Param('id') id: string, @Body() payload: Record<string, any>, @Req() req: Request) {
    return this.svc.resetPassword({ newPassword: payload.newPassword }, id, extractAuth(req))
  }
}
