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
import { FiscalyearService } from './fiscalyear.service';
import { CreateFiscalyearDto } from './dto/create-fiscalyear.dto';
import { UpdateFiscalyearDto } from './dto/update-fiscalyear.dto';
import { RetDataDto, RetDataFileDto } from 'src/utils/ret-data.dto';
import { FiscalyearEntity } from './entities/fiscalyear.entity';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('fiscalyear')
export class FiscalyearController {
  constructor(private readonly fiscalyearService: FiscalyearService) {}

  @Get('getfiscalyearfk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getFiscalyearFK() {
    return new RetDataDto(
      await this.fiscalyearService.getFiscalyearFK(),
      'Fiscalyear FK',
      'info',
    );
  }

  @Get('getbyyear')
  @ApiOkResponse({ type: RetDataDto })
  @ApiQuery({
    name: 'year',
    type: Number,
    description: 'Year of the fiscalyear',
    required: true,
  })
  async getFiscalyearByYear(@Query('year', ParseIntPipe) year: number) {
    return new RetDataDto(
      await this.fiscalyearService.getFiscalyearByYear(year),
      'Fiscalyear by year',
      'info',
    );
  }

  @Get('closeyear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  @ApiQuery({
    name: 'year',
    type: Number,
    description: 'Year of the fiscalyear',
    required: true,
  })
  @ApiQuery({
    name: 'state',
    type: Number,
    description: 'Status zum setzen',
    enum: [2, 3],
    required: true,
  })
  async closeYear(
    @Query('year', ParseIntPipe) year: number,
    @Query('state', ParseIntPipe) state: number,
  ) {
    return await this.fiscalyearService.closeYear(year, state);
  }

  @Get('writebilanz')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataFileDto })
  @ApiQuery({
    name: 'year',
    type: Number,
    description: 'Year of the fiscalyear',
    required: true,
  })
  async writeBilanz(@Query('year', ParseIntPipe) year: number) {
    return await this.fiscalyearService.writeBilanz(year);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async create(@Body() createFiscalyearDto: CreateFiscalyearDto) {
    const result = await this.fiscalyearService.create(createFiscalyearDto);
    if (!result) throw new ConflictException('Fiscalyear already exists');
    return new RetDataDto(
      new FiscalyearEntity(result),
      'Fiscalyear created',
      'info',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findAll() {
    const result = await this.fiscalyearService.findAll();
    return new RetDataDto(
      result.map((fiscalyear) => new FiscalyearEntity(fiscalyear)),
      'Fiscalyears found',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.fiscalyearService.findOne(id);
    if (!result) return new RetDataDto(undefined, 'findOne', 'info');
    return new RetDataDto(
      new FiscalyearEntity(result),
      'Fiscalyear found',
      'info',
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFiscalyearDto: UpdateFiscalyearDto,
  ) {
    const result = await this.fiscalyearService.update(id, updateFiscalyearDto);
    if (!result) throw new NotFoundException('Fiscalyear not found');
    return new RetDataDto(
      new FiscalyearEntity(result),
      'Fiscalyear updated',
      'info',
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.fiscalyearService.findOne(id);
    if (!result) throw new NotFoundException('Fiscalyear not found');
    return new RetDataDto(
      new FiscalyearEntity(result),
      'Fiscalyear removed',
      'info',
    );
  }
}
