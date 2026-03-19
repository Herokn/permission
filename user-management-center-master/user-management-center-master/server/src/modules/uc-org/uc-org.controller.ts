import { Controller, Post, Body, Inject } from '@nestjs/common'
import { UcOrgService } from './uc-org.service.js'

@Controller('api/ucOrg')
export class UcOrgController {
  constructor(@Inject(UcOrgService) private readonly svc: UcOrgService) {}
  @Post('queryAllUcOrgs') queryAll(@Body() payload: Record<string, any>) { return this.svc.queryAll(payload) }
}

