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
} from '@nestjs/common';
import { AnlaesseService } from './anlaesse.service';
import { CreateAnlaesseDto } from './dto/create-anlaesse.dto';
import { UpdateAnlaesseDto } from './dto/update-anlaesse.dto';
import { AnlaesseEntity } from './entities/anlaesse.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { RetDataFileDto } from 'src/utils/ret-data.dto';

@Controller('anlaesse')
export class AnlaesseController {
  constructor(private readonly anlaesseService: AnlaesseService) {}

  @Get('overview')
  async getOverview() {
    return await this.anlaesseService.getOverview();
  }

  @Get('getFkData')
  async getFKData(@Query('jahr') jahr: string) {
    return await this.anlaesseService.getFKData(jahr);
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
  @ApiOkResponse({ type: RetDataFileDto })
  async writeStammblatt(
    @Query('type', ParseIntPipe) type: number,
    @Query('jahr') jahr: string,
    @Query('adressId') adressId?: number,
  ) {
    return await this.anlaesseService.writeStammblatt(type, jahr, adressId);
  }

  @Post()
  @ApiCreatedResponse({ type: AnlaesseEntity })
  async create(@Body() createAnlaesseDto: CreateAnlaesseDto) {
    const anlass = await this.anlaesseService.create(createAnlaesseDto);
    if (!anlass) {
      throw new ConflictException('Anlass konnte nicht erstellt werden');
    }
    return new AnlaesseEntity(anlass);
  }

  @Get()
  @ApiQuery({
    name: 'istKegeln',
    type: Boolean,
    description: 'Filtert Anlässe nach Kegelabenden',
    required: false,
  })
  @ApiOkResponse({ type: AnlaesseEntity, isArray: true })
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
    return anlaesse.map((anlass) => new AnlaesseEntity(anlass));
  }

  @Get(':id')
  @ApiOkResponse({ type: AnlaesseEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const anlass = await this.anlaesseService.findOne(id);
    if (!anlass) {
      throw new NotFoundException('Anlass konnte nicht gefunden werden');
    }
    return new AnlaesseEntity(anlass);
  }

  @Patch(':id')
  @ApiOkResponse({ type: AnlaesseEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnlaesseDto: UpdateAnlaesseDto,
  ) {
    const anlass = await this.anlaesseService.update(id, updateAnlaesseDto);
    if (!anlass) {
      throw new NotFoundException('Anlass konnte nicht gefunden werden');
    }
    return new AnlaesseEntity(anlass);
  }

  @Delete(':id')
  @ApiOkResponse({ type: AnlaesseEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const anlass = await this.anlaesseService.findOne(id);
    if (!anlass) {
      throw new NotFoundException('Anlass konnte nicht gefunden werden');
    }
    return new AnlaesseEntity(anlass);
  }
}
