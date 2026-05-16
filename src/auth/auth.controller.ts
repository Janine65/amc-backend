//src/auth/auth.controller.ts

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import { RetDataUserDto } from 'src/utils/ret-data.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  async login(@Body() { email, password }: LoginDto) {
    const user = await this.authService.login(email, password);
    return new RetDataUserDto(
      user,
      user.accessToken,
      'Login successful',
      'info',
    );
  }
  @Get('refreshToken')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthEntity })
  async refreshToken(@Req() req: Request & { user: { id: number } }) {
    const id = req.user.id;
    const userOut = await this.authService.refresh(id);
    return new RetDataUserDto(
      userOut,
      userOut.accessToken,
      'Refresh successful',
      'info',
    );
  }
}
