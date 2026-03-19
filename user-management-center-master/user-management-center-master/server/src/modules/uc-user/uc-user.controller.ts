import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common'
import { UcUserService } from './uc-user.service.js'

@Controller('api/ucUser')
export class UcUserController {
  constructor(@Inject(UcUserService) private readonly svc: UcUserService) {}
  @Post('queryPageWithTenantAndOrgRel') queryPage(@Body() payload: Record<string, any>) { return this.svc.queryPage(payload) }
  @Post('queryDetailWithTenantAndOrgRel') queryDetail(@Body() payload: Record<string, any>) { return this.svc.queryDetail(payload) }
  @Get('queryDetailWithTenantAndOrgRel') queryDetailGet(@Query('userId') userId: string) { return this.svc.queryDetailByUserId(Number(userId) || 0) }
  @Post('addWithTenantAndOrgRel') add(@Body() payload: Record<string, any>) { return this.svc.add(payload) }
  @Post('modifyWithTenantAndOrgRelById') modify(@Body() payload: Record<string, any>) { return this.svc.modifyById(payload) }
  @Post('enableUcUserById') enable(@Body() payload: Record<string, any>) { return this.svc.enableById(payload) }
  @Get('enableUcUserById') enableGet(@Query('id') id: string) { return this.svc.enableByIdGet(Number(id) || 0) }
  @Post('disableUcUserById') disable(@Body() payload: Record<string, any>) { return this.svc.disableById(payload) }
  @Get('disableUcUserById') disableGet(@Query('id') id: string) { return this.svc.disableByIdGet(Number(id) || 0) }
}
