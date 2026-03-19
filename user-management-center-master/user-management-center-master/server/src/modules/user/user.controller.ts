import { Controller, Get, Post, Body, Param, Put, Delete, Inject } from '@nestjs/common'
import { UserService } from './user.service.js'

@Controller('api/user')
export class UserController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}
  // 兼容开发代理：将 /api/users 映射到用户列表
  @Get('/users')
  listAlias() {
    return this.userService.list()
  }
  @Get('list')
  list() {
    return this.userService.list()
  }
  @Get(':id')
  get(@Param('id') id: string) {
    return this.userService.get(Number(id))
  }
  @Post()
  create(@Body() payload: Record<string, any>) {
    return this.userService.create(payload)
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() payload: Record<string, any>) {
    return this.userService.update(Number(id), payload)
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(Number(id))
  }
}
