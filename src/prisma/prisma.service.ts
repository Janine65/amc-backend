// src/prisma/prisma.service.ts

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query | error | debug | info'
  >
  implements OnModuleDestroy
{
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
    this.$on<any>('query', (event: Prisma.QueryEvent) => {
      console.debug('--------------------------------------------------');
      console.debug('Query: ' + event.query);
      console.debug('Params: ' + event.params);
      console.debug('Duration: ' + event.duration + 'ms');
      console.debug('--------------------------------------------------');
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.info('PrismaService disconnected');
  }
}
