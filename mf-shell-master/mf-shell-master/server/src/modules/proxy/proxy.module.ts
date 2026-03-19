import { Module } from '@nestjs/common'
import { ProxyController } from './proxy.controller.js'
import { ProxyService } from './proxy.service.js'
import { HttpService } from '../../core/http/http.service.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [AuthModule],
  controllers: [ProxyController],
  providers: [ProxyService, HttpService],
})
export class ProxyModule {}
