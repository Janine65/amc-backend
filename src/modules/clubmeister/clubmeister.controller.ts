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
import { ClubmeisterService } from './clubmeister.service';
import { CreateClubmeisterDto } from './dto/create-clubmeister.dto';
import { UpdateClubmeisterDto } from './dto/update-clubmeister.dto';

@Controller('clubmeister')
export class ClubmeisterController {
  constructor(private readonly clubmeisterService: ClubmeisterService) {}

  @Post()
  create(@Body() createClubmeisterDto: CreateClubmeisterDto) {
    return this.clubmeisterService.create(createClubmeisterDto);
  }

  @Get()
  findAll() {
    return this.clubmeisterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clubmeisterService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubmeisterDto: UpdateClubmeisterDto,
  ) {
    return this.clubmeisterService.update(id, updateClubmeisterDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clubmeisterService.remove(id);
  }
}
