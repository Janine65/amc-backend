import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { AccountModule } from './modules/account/account.module';
import { AdressenModule } from './modules/adressen/adressen.module';
import { AnlaesseModule } from './modules/anlaesse/anlaesse.module';
import { BudgetModule } from './modules/budget/budget.module';
import { ClubmeisterModule } from './modules/clubmeister/clubmeister.module';
import { FiscalyearModule } from './modules/fiscalyear/fiscalyear.module';
import { JournalReceiptModule } from './modules/journal-receipt/journal-receipt.module';
import { JournalModule } from './modules/journal/journal.module';
import { KegelkasseModule } from './modules/kegelkasse/kegelkasse.module';
import { KegelmeisterModule } from './modules/kegelmeister/kegelmeister.module';
import { MeisterschaftModule } from './modules/meisterschaft/meisterschaft.module';
import { ParameterModule } from './modules/parameter/parameter.module';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { UserModule } from './modules/users/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { FileModule } from './utils/file/file.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60_000, limit: 100 },
    ]),
    FileModule,
    AuthModule,
    AccountModule,
    AdressenModule,
    AnlaesseModule,
    BudgetModule,
    ClubmeisterModule,
    FiscalyearModule,
    JournalModule,
    JournalReceiptModule,
    KegelkasseModule,
    KegelmeisterModule,
    MeisterschaftModule,
    ParameterModule,
    PrismaModule,
    ReceiptModule,
    UserModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
