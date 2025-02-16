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
} from '@nestjs/common';
import { MeisterschaftService } from './meisterschaft.service';
import { CreateMeisterschaftDto } from './dto/create-meisterschaft.dto';
import { UpdateMeisterschaftDto } from './dto/update-meisterschaft.dto';
import { RetDataDto } from 'src/utils/ret-data.dto';
import { ConfigService } from 'src/config/config.service';
import { MeisterschaftEntity } from './entities/meisterschaft.entity';

@Controller('meisterschaft')
export class MeisterschaftController {
  constructor(
    private readonly meisterschaftService: MeisterschaftService,
    private configService: ConfigService,
  ) {}

  @Post()
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
      'success',
    );
  }

  @Get()
  async findAll() {
    const meisterschaften = await this.meisterschaftService.findAll();
    return new RetDataDto(
      meisterschaften.map((m) => new MeisterschaftEntity(m)),
      'findAll',
      'info',
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const meisterschaft = await this.meisterschaftService.findOne(id);
    if (!meisterschaft) {
      throw new NotFoundException('Meisterschaft nicht gefunden');
    }
    return new RetDataDto(
      new MeisterschaftEntity(meisterschaft),
      'findOne',
      'success',
    );
  }

  @Patch(':id')
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
      'success',
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const meisterschaft = await this.meisterschaftService.remove(id);
    if (!meisterschaft) {
      throw new NotFoundException('Meisterschaft nicht gefunden');
    }
    return new RetDataDto(
      new MeisterschaftEntity(meisterschaft),
      'findOne',
      'success',
    );
  }
}
