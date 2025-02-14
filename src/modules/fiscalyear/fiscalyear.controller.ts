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
import { FiscalyearService } from './fiscalyear.service';
import { CreateFiscalyearDto } from './dto/create-fiscalyear.dto';
import { UpdateFiscalyearDto } from './dto/update-fiscalyear.dto';

@Controller('fiscalyear')
export class FiscalyearController {
  constructor(private readonly fiscalyearService: FiscalyearService) {}

  @Post()
  create(@Body() createFiscalyearDto: CreateFiscalyearDto) {
    return this.fiscalyearService.create(createFiscalyearDto);
  }

  @Get()
  findAll() {
    return this.fiscalyearService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fiscalyearService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFiscalyearDto: UpdateFiscalyearDto,
  ) {
    return this.fiscalyearService.update(id, updateFiscalyearDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fiscalyearService.remove(id);
  }
}
