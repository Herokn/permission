import { Controller, Get } from '@nestjs/common'

@Controller('api')
export class HealthController {
  @Get('ping')
  ping() { return { ts: Date.now() } }
  @Get('health')
  health() { return { status: 'ok', ts: Date.now() } }
}
