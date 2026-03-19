import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config' // 直接使用官方 ConfigModule
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { HttpService } from '../../core/http/http.service.js'

@Module({
  imports: [ConfigModule], // 这里导入的是官方的 ConfigModule
  controllers: [AuthController],
  providers: [AuthService, HttpService],
  exports: [AuthService],
})
export class AuthModule {}
