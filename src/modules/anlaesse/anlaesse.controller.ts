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
import { AnlaesseService } from './anlaesse.service';
import { CreateAnlaesseDto } from './dto/create-anlaesse.dto';
import { UpdateAnlaesseDto } from './dto/update-anlaesse.dto';

@Controller('anlaesse')
export class AnlaesseController {
  constructor(private readonly anlaesseService: AnlaesseService) {}

  @Post()
  create(@Body() createAnlaesseDto: CreateAnlaesseDto) {
    return this.anlaesseService.create(createAnlaesseDto);
  }

  @Get()
  findAll() {
    return this.anlaesseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.anlaesseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnlaesseDto: UpdateAnlaesseDto,
  ) {
    return this.anlaesseService.update(id, updateAnlaesseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.anlaesseService.remove(id);
  }
}
