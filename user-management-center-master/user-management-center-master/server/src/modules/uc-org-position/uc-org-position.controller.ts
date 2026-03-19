import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common'
import { UcOrgPositionService } from './uc-org-position.service.js'

@Controller('api/ucOrgPosition')
export class UcOrgPositionController {
  constructor(@Inject(UcOrgPositionService) private readonly svc: UcOrgPositionService) {}
  @Post('queryAllUcOrgPositions') queryAll(@Body() payload: Record<string, any>) { return this.svc.queryAll(payload) }
  @Get('queryByOrgId') queryByOrgId(@Query('orgId') orgId: string) { return this.svc.queryByOrgId({ orgId: Number(orgId) || 0 }) }
}
