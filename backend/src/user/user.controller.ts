import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // Tạo user
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // Danh sách user (search, phân trang, sort)
  @Get()
  findAll(@Query() q: QueryUserDto) {
    return this.userService.findAll(q);
  }

  // Lấy 1 user theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Cập nhật user
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  // Xóa mềm
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }
}
