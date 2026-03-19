import { Module } from '@nestjs/common'
import { UcUserController } from './uc-user.controller.js'
import { UcUserService } from './uc-user.service.js'

@Module({ controllers: [UcUserController], providers: [UcUserService] })
export class UcUserModule {}
