import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MeisterschaftService } from './meisterschaft.service';
import { CreateMeisterschaftDto } from './dto/create-meisterschaft.dto';
import { UpdateMeisterschaftDto } from './dto/update-meisterschaft.dto';

@Controller('meisterschaft')
export class MeisterschaftController {
  constructor(private readonly meisterschaftService: MeisterschaftService) {}

  @Post()
  create(@Body() createMeisterschaftDto: CreateMeisterschaftDto) {
    return this.meisterschaftService.create(createMeisterschaftDto);
  }

  @Get()
  findAll() {
    return this.meisterschaftService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.meisterschaftService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMeisterschaftDto: UpdateMeisterschaftDto,
  ) {
    return this.meisterschaftService.update(id, updateMeisterschaftDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.meisterschaftService.remove(id);
  }
}
