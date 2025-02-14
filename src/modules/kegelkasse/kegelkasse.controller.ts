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
import { KegelkasseService } from './kegelkasse.service';
import { CreateKegelkasseDto } from './dto/create-kegelkasse.dto';
import { UpdateKegelkasseDto } from './dto/update-kegelkasse.dto';

@Controller('kegelkasse')
export class KegelkasseController {
  constructor(private readonly kegelkasseService: KegelkasseService) {}

  @Post()
  create(@Body() createKegelkasseDto: CreateKegelkasseDto) {
    return this.kegelkasseService.create(createKegelkasseDto);
  }

  @Get()
  findAll() {
    return this.kegelkasseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kegelkasseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKegelkasseDto: UpdateKegelkasseDto,
  ) {
    return this.kegelkasseService.update(id, updateKegelkasseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kegelkasseService.remove(id);
  }
}
