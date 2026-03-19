import { Module } from '@nestjs/common'
import { UcOrgPositionController } from './uc-org-position.controller.js'
import { UcOrgPositionService } from './uc-org-position.service.js'

@Module({ controllers: [UcOrgPositionController], providers: [UcOrgPositionService] })
export class UcOrgPositionModule {}

