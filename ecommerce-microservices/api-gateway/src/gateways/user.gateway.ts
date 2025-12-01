import { Body, Controller, Delete, Get, Param, Post, Put, Query, Headers,  } from '@nestjs/common';
import  {ClientKafka}from '@nestjs/microservices';
import {Inject} from '@nestjs/common/decorators/core/inject.decorator';
import { CreateUserDto } from 'src/dtos/user/create-user.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QueryUserDto } from 'src/dtos/user/query-user.dto';
import { UpdateUserDto } from 'src/dtos/user/update-user.dto';

@Controller('users')
export class UserGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('user.create');
    this.kafka.subscribeToResponseOf('user.findAll');
    this.kafka.subscribeToResponseOf('user.findOne');
    this.kafka.subscribeToResponseOf('user.update');
    this.kafka.subscribeToResponseOf('user.deactivate');
    await this.kafka.connect();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.create', { dto, auth });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng (search/filter/pagination)' })
  @ApiQuery({ type: QueryUserDto })
  findAll(@Query() q: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.findAll', { q, auth });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một người dùng theo ID' })
  @ApiParam({ name: 'id', example: '67467bd24993cd524ff1a120' })
  findOne(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.findOne', { id, auth });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiParam({ name: 'id', example: '67467bd24993cd524ff1a120' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.update', { id, dto, auth });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Vô hiệu hóa / deactivate người dùng' })
  @ApiParam({ name: 'id', example: '67467bd24993cd524ff1a120' })
  deactivate(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.deactivate', { id, auth });
  }
}
