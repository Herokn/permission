import { Module } from '@nestjs/common'
import { UcOrgController } from './uc-org.controller.js'
import { UcOrgService } from './uc-org.service.js'

@Module({ controllers: [UcOrgController], providers: [UcOrgService] })
export class UcOrgModule {}

