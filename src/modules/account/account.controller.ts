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
  Query,
  ParseDatePipe,
  ParseBoolPipe,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountEntity } from './entities/account.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { RetDataDto, RetDataFileDto } from 'src/utils/ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('getaccjahr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getAccountJahr(
    @Query('jahr', ParseIntPipe) jahr: number,
    @Query('all', ParseIntPipe) all: number,
  ) {
    return new RetDataDto(
      await this.accountService.getAccountJahr(jahr, all),
      'Account Jahr',
      'info',
    );
  }

  @Get('getonedatabyorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getOneDataByOrder(@Query('order', ParseIntPipe) order: number) {
    const result = await this.accountService.getOneDataByOrder(order);
    if (!result) {
      throw new NotFoundException('Account not created');
    }
    return new RetDataDto(
      new AccountEntity(result),
      'Account by order',
      'info',
    );
  }

  @Get('getamountoneacc')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getAmountOneAcc(
    @Query('order', ParseIntPipe) order: number,
    @Query('date', new ParseDatePipe()) date: Date,
  ) {
    return new RetDataDto(
      await this.accountService.getAmountOneAcc(order, date),
      'Amount one account',
      'info',
    );
  }

  @Get('getfkdata')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getFKData() {
    return new RetDataDto(
      await this.accountService.getFKData(),
      'FK Data',
      'info',
    );
  }

  @Get('getaccountsummary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getAccountSummary(@Query('jahr', ParseIntPipe) jahr: number) {
    return new RetDataDto(
      await this.accountService.getAccountSummary(jahr),
      'Account Summary',
      'info',
    );
  }

  @Get('writekontoauszug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataFileDto })
  async writeKontoauszug(
    @Query('year', ParseIntPipe) year: number,
    @Query('all', ParseBoolPipe) all: boolean,
  ) {
    return await this.accountService.writeKontoauszug(year, all);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RetDataDto })
  async create(@Body() createAccountDto: CreateAccountDto) {
    const result = await this.accountService.create(createAccountDto);
    if (!result) {
      throw new NotFoundException('Account not created');
    }
    return new RetDataDto(new AccountEntity(result), 'Account created', 'info');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findAll() {
    const result = await this.accountService.findAll();
    return new RetDataDto(
      result.map((item) => new AccountEntity(item)),
      'Account found',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.accountService.findOne(id);
    if (!result) {
      throw new NotFoundException('Account not found');
    }
    return new RetDataDto(new AccountEntity(result), 'Account found', 'info');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const result = await this.accountService.update(id, updateAccountDto);
    if (!result) {
      throw new NotFoundException('Account not updated');
    }
    return new RetDataDto(new AccountEntity(result), 'Account updated', 'info');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.accountService.remove(id);
    if (!result) {
      throw new NotFoundException('Account not deleted');
    }
    return new RetDataDto(new AccountEntity(result), 'Account deleted', 'info');
  }
}
