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
  ConflictException,
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
import { RetDataDto, RetDataFileDto } from 'src/utils/ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}
  // this.router.get(this.path + 'write', authMiddleware, this.writeJournal);
  @Post()
  @ApiCreatedResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createJournalDto: CreateJournalDto) {
    const journal = await this.journalService.create(createJournalDto);
    if (journal) {
      return new RetDataDto(
        new JournalEntity(journal),
        'Journal created',
        'info',
      );
    } else {
      throw new ConflictException('Journal not created');
    }
  }

  @Get()
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll() {
    const journals = await this.journalService.findAll();
    return new RetDataDto(
      journals.map((journal) => new JournalEntity(journal)),
      'Journal found',
      'info',
    );
  }

  @Get('getbyyear')
  @ApiOkResponse({ type: RetDataDto, isArray: true })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findByYear(@Query('year', ParseIntPipe) year: number) {
    const journals = await this.journalService.findByYear(year);
    return new RetDataDto(
      journals.map((journal) => new JournalEntity(journal)),
      'Journal found',
      'info',
    );
  }

  @Get('getaccdata')
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findByAccount(
    @Query('account', ParseIntPipe) account: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const journals = await this.journalService.findByAccount(account, year);
    return new RetDataDto(
      journals.map((journal) => new JournalEntity(journal)),
      'Journal found',
      'info',
    );
  }

  @Get('write')
  @ApiOkResponse({ type: RetDataFileDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  write(
    @Query('receipt', ParseIntPipe) receipt: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.journalService.writeJournal(year, Boolean(receipt));
  }

  @Get(':id')
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const journal = await this.journalService.findOne(id);
    if (journal) {
      return new RetDataDto(
        new JournalEntity(journal),
        'Journal found',
        'info',
      );
    } else {
      return new RetDataDto(undefined, 'findOne', 'info');
    }
  }

  @Patch(':id')
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJournalDto: UpdateJournalDto,
  ) {
    const journal = await this.journalService.update(id, updateJournalDto);
    if (journal) {
      return new RetDataDto(
        new JournalEntity(journal),
        'Journal updated',
        'info',
      );
    } else {
      throw new NotFoundException('Journal not updated');
    }
  }

  @Delete(':id')
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number) {
    const journal = await this.journalService.remove(id);
    if (journal) {
      return new RetDataDto(
        new JournalEntity(journal),
        'Journal deleted',
        'info',
      );
    } else {
      throw new NotFoundException('Journal not deleted');
    }
  }
}
