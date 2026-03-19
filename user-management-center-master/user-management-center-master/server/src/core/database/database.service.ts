import { Injectable } from '@nestjs/common'

@Injectable()
export class DatabaseService {
  async connect() { return true }
}
