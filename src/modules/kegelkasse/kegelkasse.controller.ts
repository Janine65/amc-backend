import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ConflictException,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KegelkasseService } from './kegelkasse.service';
import { CreateKegelkasseDto } from './dto/create-kegelkasse.dto';
import { UpdateKegelkasseDto } from './dto/update-kegelkasse.dto';
import { RetDataDto, RetDataFileDto } from 'src/utils/ret-data.dto';
import { KegelkasseEntity } from './entities/kegelkasse.entity';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('kegelkasse')
export class KegelkasseController {
  constructor(private readonly kegelkasseService: KegelkasseService) {}

  @Get('kassebydatum')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async kasseByDatum(
    @Query('monat', ParseIntPipe) monat: number,
    @Query('jahr') jahr: number,
  ) {
    const kegelkasse = await this.kegelkasseService.findOneByDatum(monat, jahr);
    if (!kegelkasse) {
      throw new NotFoundException('Kegelkasse nicht gefunden');
    }
    const retKegelkasse = new KegelkasseEntity(kegelkasse);
    return new RetDataDto(retKegelkasse, 'kasseByDatum', 'info');
  }

  @Get('kassebyjahr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async kasseByJahr(@Query('jahr') jahr: string) {
    const kegelkassen = await this.kegelkasseService.findByJahr(jahr);
    return new RetDataDto(
      kegelkassen.map((rec) => new KegelkasseEntity(rec)),
      'kasseByJahr',
      'info',
    );
  }

  @Get('genreceipt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataFileDto, isArray: false })
  genReceipt(@Query('kegelkasseId', ParseIntPipe) id: number) {
    return this.kegelkasseService.genReceiptPDF(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async create(@Body() createKegelkasseDto: CreateKegelkasseDto) {
    const kegelkasse = await this.kegelkasseService.create(createKegelkasseDto);
    if (!kegelkasse) {
      throw new ConflictException('Kegelkasse konnte nicht erstellt werden');
    }
    return new RetDataDto(new KegelkasseEntity(kegelkasse), 'create', 'info');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findAll() {
    const kegelkassen = await this.kegelkasseService.findAll();
    return new RetDataDto(
      kegelkassen.map((rec) => new KegelkasseEntity(rec)),
      'findAll',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const kegelkasse = await this.kegelkasseService.findOne(id);
    if (!kegelkasse) {
      throw new NotFoundException('Kegelkasse konnte nicht erstellt werden');
    }
    return new RetDataDto(new KegelkasseEntity(kegelkasse), 'findOne', 'info');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKegelkasseDto: UpdateKegelkasseDto,
  ) {
    const kegelkasse = await this.kegelkasseService.update(
      id,
      updateKegelkasseDto,
    );
    if (!kegelkasse) {
      throw new NotFoundException('Kegelkasse nicht gefunden');
    }
    return new RetDataDto(new KegelkasseEntity(kegelkasse), 'update', 'info');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const kegelkasse = await this.kegelkasseService.remove(id);
    if (!kegelkasse) {
      throw new NotFoundException('Kegelkasse nicht gefunden');
    }
    return new RetDataDto(new KegelkasseEntity(kegelkasse), 'remove', 'info');
  }
}
