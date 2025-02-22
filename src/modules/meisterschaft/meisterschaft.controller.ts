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
import { MeisterschaftService } from './meisterschaft.service';
import { CreateMeisterschaftDto } from './dto/create-meisterschaft.dto';
import { UpdateMeisterschaftDto } from './dto/update-meisterschaft.dto';
import { RetDataDto } from 'src/utils/ret-data.dto';
import { ConfigService } from 'src/config/config.service';
import { MeisterschaftEntity } from './entities/meisterschaft.entity';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('meisterschaft')
export class MeisterschaftController {
  constructor(
    private readonly meisterschaftService: MeisterschaftService,
    private configService: ConfigService,
  ) {}

  @Get('listevent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async listEvent(@Query('eventid', ParseIntPipe) eventid: number) {
    const meisterschaft =
      await this.meisterschaftService.getMeisterschaftForEvent(eventid);
    return new RetDataDto(
      meisterschaft.map((m) => new MeisterschaftEntity(m)),
      'Liste der Meisterschaften für Event',
      'info',
    );
  }

  @Get('listmitglied')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async listMitglied(@Query('mitgliedid', ParseIntPipe) mitgliedid: number) {
    const meisterschaft =
      await this.meisterschaftService.getMeisterschaftForMitglied(mitgliedid);
    return new RetDataDto(
      meisterschaft.map((m) => new MeisterschaftEntity(m)),
      'Liste der Meisterschaften für Mitglied',
      'info',
    );
  }

  @Get('listmitgliedmeister')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async listMitgliedMeister(
    @Query('mitgliedid', ParseIntPipe) mitgliedid: number,
  ) {
    return new RetDataDto(
      await this.meisterschaftService.getMeisterForMitglied(mitgliedid),
      'Liste der Meisterschaften für Mitglied',
      'info',
    );
  }

  @Get('checkjahr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async checkJahr(@Query('jahr') jahr: string) {
    return new RetDataDto(
      await this.meisterschaftService.checkJahr(jahr),
      'Jahr geprüft',
      'info',
    );
  }

  @Get('getchartdata')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async getChartData(@Query('jahr') jahr: string) {
    return new RetDataDto(
      await this.meisterschaftService.getChartData(jahr),
      'Chartdaten',
      'info',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async create(@Body() createMeisterschaftDto: CreateMeisterschaftDto) {
    const meisterschaft = await this.meisterschaftService.create(
      createMeisterschaftDto,
    );
    if (!meisterschaft) {
      throw new ConflictException('Meisterschaft konnte nicht erstellt werden');
    }
    return new RetDataDto(
      new MeisterschaftEntity(meisterschaft),
      'create',
      'info',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findAll() {
    const meisterschaften = await this.meisterschaftService.findAll();
    return new RetDataDto(
      meisterschaften.map((m) => new MeisterschaftEntity(m)),
      'findAll',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const meisterschaft = await this.meisterschaftService.findOne(id);
    if (!meisterschaft) {
      throw new NotFoundException('Meisterschaft nicht gefunden');
    }
    return new RetDataDto(
      new MeisterschaftEntity(meisterschaft),
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
    @Body() updateMeisterschaftDto: UpdateMeisterschaftDto,
  ) {
    const meisterschaft = await this.meisterschaftService.update(
      id,
      updateMeisterschaftDto,
    );
    if (!meisterschaft) {
      throw new NotFoundException('Meisterschaft nicht gefunden');
    }
    return new RetDataDto(
      new MeisterschaftEntity(meisterschaft),
      'findOne',
      'info',
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto, isArray: false })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const meisterschaft = await this.meisterschaftService.remove(id);
    if (!meisterschaft) {
      throw new NotFoundException('Meisterschaft nicht gefunden');
    }
    return new RetDataDto(
      new MeisterschaftEntity(meisterschaft),
      'findOne',
      'info',
    );
  }
}
