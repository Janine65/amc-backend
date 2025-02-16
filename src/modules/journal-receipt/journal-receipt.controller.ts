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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RetDataDto } from 'src/utils/ret-data.dto';

@Controller('journal-receipt')
export class JournalReceiptController {
  constructor(private readonly journalReceiptService: JournalReceiptService) {}
  @Post('add2journal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
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
    return { message: 'JournalReceipt added', type: 'info', data: journ };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RetDataDto })
  async create(@Body() createJournalReceiptDto: CreateJournalReceiptDto) {
    const journ = await this.journalReceiptService.create(
      createJournalReceiptDto,
    );
    if (!journ) {
      throw new NotFoundException('Journal not found');
    }
    return new RetDataDto(
      new JournalReceiptEntity(journ),
      'JournalReceipt created',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findAll() {
    const journ = await this.journalReceiptService.findAll();
    return new RetDataDto(
      journ.map((journal) => new JournalReceiptEntity(journal)),
      'JournalReceipts found',
    );
  }

  @Get('getbyjournalid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getbyjournalid(@Query('journalid', ParseIntPipe) journalid: number) {
    const journ = await this.journalReceiptService.findAllByJournal(journalid);
    if (!journ) {
      throw new NotFoundException('JournalRedeipt not found');
    }
    return new RetDataDto(
      journ.map((journal) => new JournalReceiptEntity(journal)),
      'JournalReceipt found',
    );
  }

  @Get('getbyreceiptid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getbyreceiptid(@Query('receiptid', ParseIntPipe) receiptId: number) {
    const journ = await this.journalReceiptService.findAllByReceipt(receiptId);
    if (!journ) {
      throw new NotFoundException('JournalReceipt not found');
    }
    return new RetDataDto(
      journ.map(
        (journal) => new JournalReceiptEntity(journal),
        'JournalReceipt found',
      ),
    );
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async remove(
    @Query('journalid', ParseIntPipe) journalid: number,
    @Query('receiptid', ParseIntPipe) receiptid: number,
  ) {
    return new RetDataDto(
      await this.journalReceiptService.remove(journalid, receiptid),
      'JournalReceipt removed',
    );
  }
}
