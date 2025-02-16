import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RetDataDto } from 'src/utils/ret-data.dto';

@Controller('user')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RetDataDto })
  async create(@Body() createUserDto: CreateUserDto) {
    const userRec = await this.userService.create(createUserDto);
    return new RetDataDto(new UserEntity(userRec), 'User created', 'info');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async list() {
    const users = await this.userService.findAll();
    return new RetDataDto(
      users.map((user) => new UserEntity(user)),
      'Users found',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return new RetDataDto(new UserEntity(user), 'User found', 'info');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  current(@Req() req: Request & { user: any }) {
    return new RetDataDto(new UserEntity(req.user), 'User created', 'info');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return new RetDataDto(
      new UserEntity(await this.userService.update(id, updateUserDto)),
      'User updated',
      'info',
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userService.remove(id);
    return new RetDataDto(new UserEntity(result), 'User deleted', 'info');
  }

  @Get('newpass/:email')
  @ApiOkResponse({ type: RetDataDto })
  async newpass(@Param('email') email: string) {
    return new RetDataDto(
      await this.userService.newPassword(email),
      'New password sent',
      'info',
    );
  }
}
