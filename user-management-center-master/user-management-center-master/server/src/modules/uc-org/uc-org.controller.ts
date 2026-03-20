import { Controller, Post, Body, Inject } from '@nestjs/common'
import { UcOrgService } from './uc-org.service.js'
import type { Request } from 'express'

function extractAuth(req: Request): string | undefined {
  const auth = req.headers.authorization
  if (auth) return auth
    return this.svc.add(payload, extractAuth(req))
  }

  @Put(':id')
  modify(@Param('id') id: string, @Body() payload: Record<string, any>, @Req() req: Request) {
    return this.svc.modify(Number(id), payload, extractAuth(req))
  }

  @Post(':id/positions')
  configPositions(@Param('id') id: string, @Body() positionIds: number[], @Req() req: Request) {
    return this.svc.configPositions(Number(id), positionIds, extractAuth(req))
  }
}
