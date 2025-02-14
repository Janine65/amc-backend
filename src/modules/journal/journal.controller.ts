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
  ParseBoolPipe,
  UseGuards,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { JournalEntity } from './entities/journal.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { RetDataFileDto } from 'src/utils/ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}
  // this.router.get(this.path + 'write', authMiddleware, this.writeJournal);
  @Post()
  @ApiCreatedResponse({ type: JournalEntity })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createJournalDto: CreateJournalDto) {
    const journal = await this.journalService.create(createJournalDto);
    if (journal) {
      return new JournalEntity(journal);
    } else {
      throw new NotFoundException('Journal not created');
    }
  }

  @Get()
  @ApiOkResponse({ type: JournalEntity, isArray: true })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll() {
    const journals = await this.journalService.findAll();
    return journals.map((journal) => new JournalEntity(journal));
  }

  @Get('getbyyear')
  @ApiOkResponse({ type: JournalEntity, isArray: true })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findByYear(@Query('year', ParseIntPipe) year: number) {
    const journals = await this.journalService.findByYear(year);
    return journals.map((journal) => new JournalEntity(journal));
  }

  @Get('getaccdata')
  @ApiOkResponse({ type: JournalEntity, isArray: true })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findByAccount(
    @Query('account', ParseIntPipe) account: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const journals = await this.journalService.findByAccount(account, year);
    return journals.map((journal) => new JournalEntity(journal));
  }

  @Get('write')
  @ApiOkResponse({ type: RetDataFileDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  write(
    @Query('receipt', ParseBoolPipe) receipt: boolean,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.journalService.writeJournal(year, receipt);
  }

  @Get(':id')
  @ApiOkResponse({ type: JournalEntity })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const journal = await this.journalService.findOne(id);
    if (journal) {
      return new JournalEntity(journal);
    } else {
      throw new NotFoundException('Journal not found');
    }
  }

  @Patch(':id')
  @ApiOkResponse({ type: JournalEntity })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJournalDto: UpdateJournalDto,
  ) {
    const journal = await this.journalService.update(id, updateJournalDto);
    if (journal) {
      return new JournalEntity(journal);
    } else {
      throw new NotFoundException('Journal not updated');
    }
  }

  @Delete(':id')
  @ApiOkResponse({ type: JournalEntity })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number) {
    const journal = await this.journalService.remove(id);
    if (journal) {
      return new JournalEntity(journal);
    } else {
      throw new NotFoundException('Journal not deleted');
    }
  }
}
