import { Module } from '@nestjs/common'
import { HealthModule } from './modules/health/health.module.js'
import { MockModule } from './modules/mock/mock.module.js'
import { UserModule } from './modules/user/user.module.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { UcUserModule } from './modules/uc-user/uc-user.module.js'
import { UcOrgModule } from './modules/uc-org/uc-org.module.js'
import { UcOrgPositionModule } from './modules/uc-org-position/uc-org-position.module.js'

@Module({ imports: [HealthModule, MockModule, UserModule, AuthModule, UcUserModule, UcOrgModule, UcOrgPositionModule] })
export class AppModule {}
