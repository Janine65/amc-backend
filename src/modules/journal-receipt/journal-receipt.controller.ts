import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  ParseIntPipe,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { JournalReceiptService } from './journal-receipt.service';
import { CreateJournalReceiptDto } from './dto/create-journal-receipt.dto';
import { JournalReceiptEntity } from './entities/journal-receipt.entity';
import { ReceiptEntity } from '../receipt/entities/receipt.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('journal-receipt')
export class JournalReceiptController {
  constructor(private readonly journalReceiptService: JournalReceiptService) {}
  @Post('add2journal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async add2journal(
    @Query('journalid', ParseIntPipe) journalid: number,
    @Body() receipts: ReceiptEntity[],
  ) {
    const journ = await this.journalReceiptService.add2journal(
      journalid,
      receipts,
    );
    if (!journ) {
      throw new NotFoundException('Journal not found');
    }
    return { message: 'JournalReceipt added', type: 'info' };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createJournalReceiptDto: CreateJournalReceiptDto) {
    const journ = await this.journalReceiptService.create(
      createJournalReceiptDto,
    );
    if (!journ) {
      throw new NotFoundException('Journal not found');
    }
    return new JournalReceiptEntity(journ);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll() {
    const journ = await this.journalReceiptService.findAll();
    return journ.map((journal) => new JournalReceiptEntity(journal));
  }

  @Get('getbyjournalid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getbyjournalid(@Query('journalid', ParseIntPipe) journalid: number) {
    const journ = await this.journalReceiptService.findAllByJournal(journalid);
    if (!journ) {
      throw new NotFoundException('JournalRedeipt not found');
    }
    return journ.map((journal) => new JournalReceiptEntity(journal));
  }

  @Get('getbyreceiptid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getbyreceiptid(@Query('receiptid', ParseIntPipe) receiptId: number) {
    const journ = await this.journalReceiptService.findAllByReceipt(receiptId);
    if (!journ) {
      throw new NotFoundException('JournalReceipt not found');
    }
    return journ.map((journal) => new JournalReceiptEntity(journal));
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @Query('journalid', ParseIntPipe) journalid: number,
    @Query('receiptid', ParseIntPipe) receiptid: number,
  ) {
    return this.journalReceiptService.remove(journalid, receiptid);
  }
}
