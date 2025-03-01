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
  ConflictException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KegelmeisterService } from './kegelmeister.service';
import { CreateKegelmeisterDto } from './dto/create-kegelmeister.dto';
import { UpdateKegelmeisterDto } from './dto/update-kegelmeister.dto';
import { KegelmeisterEntity } from './entities/kegelmeister.entity';
import { RetDataDto } from 'src/utils/ret-data.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('kegelmeister')
export class KegelmeisterController {
  constructor(private readonly kegelmeisterService: KegelmeisterService) {}

  @Get('byjahr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findAllByJahr(@Query('jahr') jahr: string) {
    const kegelmeisters = await this.kegelmeisterService.findAllByJahr(jahr);
    return new RetDataDto(
      kegelmeisters.map((kegelmeister) => new KegelmeisterEntity(kegelmeister)),
      'findAll',
      'info',
    );
  }

  @Get('overview')
  @ApiResponse({ type: RetDataDto, isArray: false })
  async overview() {
    return new RetDataDto(
      await this.kegelmeisterService.overview(),
      'Übersicht Kegelmeister',
      'info',
    );
  }

  @Get('calcMeister')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async calcMeister(@Query('jahr') jahr: string) {
    return new RetDataDto(
      await this.kegelmeisterService.calcMeister(jahr),
      'Berechnung Kegelmeister',
      'info',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async create(@Body() createKegelmeisterDto: CreateKegelmeisterDto) {
    const kegelmeister = await this.kegelmeisterService.create(
      createKegelmeisterDto,
    );
    if (!kegelmeister) {
      throw new ConflictException('Kegelmeister nicht gefunden');
    }
    return new RetDataDto(
      new KegelmeisterEntity(kegelmeister),
      'create',
      'info',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findAll() {
    const kegelmeisters = await this.kegelmeisterService.findAll();
    return new RetDataDto(
      kegelmeisters.map((kegelmeister) => new KegelmeisterEntity(kegelmeister)),
      'findAll',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const kegelmeister = await this.kegelmeisterService.findOne(id);
    if (!kegelmeister) {
      return new RetDataDto(undefined, 'findOne', 'info');
    }
    return new RetDataDto(
      new KegelmeisterEntity(kegelmeister),
      'findOne',
      'info',
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKegelmeisterDto: UpdateKegelmeisterDto,
  ) {
    const kegelmeister = await this.kegelmeisterService.update(
      id,
      updateKegelmeisterDto,
    );
    if (!kegelmeister) {
      throw new NotFoundException('Kegelmeister nicht gefunden');
    }
    return new RetDataDto(
      new KegelmeisterEntity(kegelmeister),
      'update',
      'info',
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const kegelmeister = await this.kegelmeisterService.remove(id);
    if (!kegelmeister) {
      throw new NotFoundException('Kegelmeister nicht gefunden');
    }
    return new RetDataDto(
      new KegelmeisterEntity(kegelmeister),
      'remove',
      'info',
    );
  }
}
