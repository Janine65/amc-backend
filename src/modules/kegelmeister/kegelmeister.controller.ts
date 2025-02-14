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
import { KegelmeisterService } from './kegelmeister.service';
import { CreateKegelmeisterDto } from './dto/create-kegelmeister.dto';
import { UpdateKegelmeisterDto } from './dto/update-kegelmeister.dto';

@Controller('kegelmeister')
export class KegelmeisterController {
  constructor(private readonly kegelmeisterService: KegelmeisterService) {}

  @Post()
  create(@Body() createKegelmeisterDto: CreateKegelmeisterDto) {
    return this.kegelmeisterService.create(createKegelmeisterDto);
  }

  @Get()
  findAll() {
    return this.kegelmeisterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kegelmeisterService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKegelmeisterDto: UpdateKegelmeisterDto,
  ) {
    return this.kegelmeisterService.update(id, updateKegelmeisterDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kegelmeisterService.remove(id);
  }
}
