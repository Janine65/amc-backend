import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ConflictException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AnlaesseService } from './anlaesse.service';
import { CreateAnlaesseDto } from './dto/create-anlaesse.dto';
import { UpdateAnlaesseDto } from './dto/update-anlaesse.dto';
import { AnlaesseEntity } from './entities/anlaesse.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RetDataDto, RetDataFileDto } from 'src/utils/ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('anlaesse')
export class AnlaesseController {
  constructor(private readonly anlaesseService: AnlaesseService) {}

  @Get('overview')
  @ApiOkResponse({ type: RetDataDto })
  async getOverview() {
    return new RetDataDto(
      await this.anlaesseService.getOverview(),
      'Übersicht Anlässe',
      'info',
    );
  }

  @Get('getFkData')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getFKData(@Query('jahr') jahr: string) {
    return new RetDataDto({
      type: 'info',
      data: await this.anlaesseService.getFKData(jahr),
    });
  }

  @Get('writestammblatt')
  @ApiQuery({
    name: 'type',
    type: Number,
    description: 'Typ des Stammblatts',
    required: true,
    enum: [0, 1, 2],
  })
  @ApiQuery({
    name: 'jahr',
    type: String,
    description: 'Jahr des Stammblatts',
    required: true,
  })
  @ApiQuery({
    name: 'adressId',
    type: Number,
    description: 'ID der Adresse',
    required: false,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataFileDto })
  async writeStammblatt(
    @Query('type', ParseIntPipe) type: number,
    @Query('jahr') jahr: string,
    @Query('adressId') adressId?: number,
  ) {
    return await this.anlaesseService.writeStammblatt(type, jahr, adressId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RetDataDto })
  async create(@Body() createAnlaesseDto: CreateAnlaesseDto) {
    const anlass = await this.anlaesseService.create(createAnlaesseDto);
    if (!anlass) {
      throw new ConflictException('Anlass konnte nicht erstellt werden');
    }
    return new RetDataDto(
      new AnlaesseEntity(anlass),
      'Anlass erstellt',
      'info',
    );
  }

  @Get()
  @ApiQuery({
    name: 'istKegeln',
    type: Boolean,
    description: 'Filtert Anlässe nach Kegelabenden',
    required: false,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto, isArray: false })
  async findAll(
    @Query('fromJahr', ParseIntPipe) fromJahr: number,
    @Query('toJahr', ParseIntPipe) toJahr: number,
    @Query('istKegeln') istKegeln?: string,
  ) {
    const anlaesse = await this.anlaesseService.findAll(
      fromJahr,
      toJahr,
      istKegeln,
    );
    return new RetDataDto(
      anlaesse.map((anlass) => new AnlaesseEntity(anlass)),
      'Anlässe gefunden',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const anlass = await this.anlaesseService.findOne(id);
    if (!anlass) {
      throw new NotFoundException('Anlass konnte nicht gefunden werden');
    }
    return new RetDataDto(
      new AnlaesseEntity(anlass),
      'Anlass gefunden',
      'info',
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnlaesseDto: UpdateAnlaesseDto,
  ) {
    const anlass = await this.anlaesseService.update(id, updateAnlaesseDto);
    if (!anlass) {
      throw new NotFoundException('Anlass konnte nicht gefunden werden');
    }
    return new RetDataDto(
      new AnlaesseEntity(anlass),
      'Anlass aktualisiert',
      'info',
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const anlass = await this.anlaesseService.findOne(id);
    if (!anlass) {
      throw new NotFoundException('Anlass konnte nicht gefunden werden');
    }
    return new RetDataDto(
      new AnlaesseEntity(anlass),
      'Anlass gelöscht',
      'info',
    );
  }
}
