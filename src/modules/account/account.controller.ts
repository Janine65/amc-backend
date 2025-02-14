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
import { RetDataFileDto } from 'src/utils/ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('getaccjahr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AccountEntity, isArray: true })
  async getAccountJahr(
    @Query('jahr', ParseIntPipe) jahr: number,
    @Query('all', ParseIntPipe) all: number,
  ) {
    return await this.accountService.getAccountJahr(jahr, all);
  }

  @Get('getonedatabyorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AccountEntity, isArray: false })
  async getOneDataByOrder(@Query('order', ParseIntPipe) order: number) {
    const result = await this.accountService.getOneDataByOrder(order);
    if (!result) {
      throw new NotFoundException('Account not created');
    }
    return new AccountEntity(result);
  }

  @Get('getamountoneacc')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  async getAmountOneAcc(
    @Query('order', ParseIntPipe) order: number,
    @Query('date', new ParseDatePipe()) date: Date,
  ) {
    return await this.accountService.getAmountOneAcc(order, date);
  }

  @Get('getfkdata')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  async getFKData() {
    return await this.accountService.getFKData();
  }

  @Get('getaccountsummary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  async getAccountSummary(@Query('jahr', ParseIntPipe) jahr: number) {
    return await this.accountService.getAccountSummary(jahr);
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
  @ApiCreatedResponse({ type: AccountEntity })
  async create(@Body() createAccountDto: CreateAccountDto) {
    const result = await this.accountService.create(createAccountDto);
    if (!result) {
      throw new NotFoundException('Account not created');
    }
    return new AccountEntity(result);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AccountEntity, isArray: true })
  async findAll() {
    const result = await this.accountService.findAll();
    return result.map((item) => new AccountEntity(item));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AccountEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.accountService.findOne(id);
    if (!result) {
      throw new NotFoundException('Account not found');
    }
    return new AccountEntity(result);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AccountEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const result = await this.accountService.update(id, updateAccountDto);
    if (!result) {
      throw new NotFoundException('Account not updated');
    }
    return new AccountEntity(result);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AccountEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.accountService.remove(id);
    if (!result) {
      throw new NotFoundException('Account not deleted');
    }
    return new AccountEntity(result);
  }
}
