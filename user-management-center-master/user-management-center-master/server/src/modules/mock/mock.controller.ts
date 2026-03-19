import { Controller, Get } from '@nestjs/common'
import type { Item } from '@wb/shared'

@Controller('api/mock')
export class MockController {
  @Get('items')
  items(): Item[] {
    return [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ]
  }
}
