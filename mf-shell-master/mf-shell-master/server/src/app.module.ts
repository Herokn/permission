import { Module } from '@nestjs/common'
import { ConfigModule } from './configs/config.module.js'
import { HealthModule } from './modules/health/health.module.js'
import { MockModule } from './modules/mock/mock.module.js'
import { UserModule } from './modules/user/user.module.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { ProxyModule } from './modules/proxy/proxy.module.js'

@Module({ imports: [ConfigModule, HealthModule, MockModule, UserModule, AuthModule, ProxyModule] })
export class AppModule {}
