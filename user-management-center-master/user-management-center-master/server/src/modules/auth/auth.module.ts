import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { HttpService } from '../../core/http/http.service.js'

@Module({ controllers: [AuthController], providers: [AuthService, HttpService] })
export class AuthModule {}
