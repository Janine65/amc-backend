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
import { ClubmeisterService } from './clubmeister.service';
import { CreateClubmeisterDto } from './dto/create-clubmeister.dto';
import { UpdateClubmeisterDto } from './dto/update-clubmeister.dto';
import { RetDataDto } from 'src/utils/ret-data.dto';
import { ClubmeisterEntity } from './entities/clubmeister.entity';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('clubmeister')
export class ClubmeisterController {
  constructor(private readonly clubmeisterService: ClubmeisterService) {}

  @Get('byjahr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findAllByJahr(@Query('jahr') jahr: string) {
    const clubmeisters = await this.clubmeisterService.findAllByJahr(jahr);
    return new RetDataDto(
      clubmeisters.map((clubmeister) => new ClubmeisterEntity(clubmeister)),
      'findAll',
      'info',
    );
  }

  @Get('overview')
  @ApiResponse({ type: RetDataDto, isArray: false })
  async overview() {
    return new RetDataDto(
      await this.clubmeisterService.overview(),
      'Übersicht Clubmeister',
      'info',
    );
  }

  @Get('calcMeister')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async calcMeister(@Query('jahr') jahr: string) {
    return new RetDataDto(
      await this.clubmeisterService.calcMeister(jahr),
      'Berechnung Clubmeister',
      'info',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async create(@Body() createClubmeisterDto: CreateClubmeisterDto) {
    const clubmeister =
      await this.clubmeisterService.create(createClubmeisterDto);
    if (!clubmeister) {
      throw new ConflictException('Clubmeister konnte nicht erstellt werden');
    }
    return new RetDataDto(new ClubmeisterEntity(clubmeister), 'create', 'info');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findAll() {
    const clubmeisters = await this.clubmeisterService.findAll();
    return new RetDataDto(
      clubmeisters.map((clubmeister) => new ClubmeisterEntity(clubmeister)),
      'findAll',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const clubmeister = await this.clubmeisterService.findOne(id);
    if (!clubmeister) {
      throw new NotFoundException('Clubmeister nicht gefunden');
    }
    return new RetDataDto(
      new ClubmeisterEntity(clubmeister),
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
    @Body() updateClubmeisterDto: UpdateClubmeisterDto,
  ) {
    const clubmeister = await this.clubmeisterService.update(
      id,
      updateClubmeisterDto,
    );
    if (!clubmeister) {
      throw new NotFoundException('Clubmeister nicht gefunden');
    }
    return new RetDataDto(new ClubmeisterEntity(clubmeister), 'update', 'info');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const clubmeister = await this.clubmeisterService.remove(id);
    if (!clubmeister) {
      throw new NotFoundException('Clubmeister nicht gefunden');
    }
    return new RetDataDto(new ClubmeisterEntity(clubmeister), 'remove', 'info');
  }
}
