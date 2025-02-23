import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as pkg from '../package.json';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('about')
  getAbout(): string {
    return JSON.stringify(pkg);
  }

  @Get('health')
  getHealth(): string {
    return 'OK';
  }
}
