import { Module } from '@nestjs/common'
import { HealthModule } from './health/health.module.js'
import { MockModule } from './mock/mock.module.js'
import { UserModule } from './user/user.module.js'
import { AuthModule } from './auth/auth.module.js'
import { UcUserModule } from './uc-user/uc-user.module.js'
import { UcOrgModule } from './uc-org/uc-org.module.js'
import { UcOrgPositionModule } from './uc-org-position/uc-org-position.module.js'

@Module({ imports: [HealthModule, MockModule, UserModule, AuthModule, UcUserModule, UcOrgModule, UcOrgPositionModule] })
export class AppModule {}
