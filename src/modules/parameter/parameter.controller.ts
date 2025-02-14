import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ParameterService } from './parameter.service';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParameterEntity } from './entities/parameter.entity';
import { parameter } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('parameter')
@ApiTags('Parameter')
export class ParameterController {
  constructor(private readonly parameterService: ParameterService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ParameterEntity })
  async create(@Body() createParameterDto: CreateParameterDto) {
    return new ParameterEntity(
      await this.parameterService.create(createParameterDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: ParameterEntity, isArray: true })
  async findAll() {
    const parameters: parameter[] = await this.parameterService.findAll();
    return parameters.map((parameter) => new ParameterEntity(parameter));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ParameterEntity, isArray: false })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const paramRec = await this.parameterService.findOne(id);
    if (!paramRec) {
      throw new NotFoundException(`Parameter with ${id} does not exist.`);
    }
    return new ParameterEntity(paramRec);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ParameterEntity, isArray: false })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateParameterDto: UpdateParameterDto,
  ) {
    return new ParameterEntity(
      await this.parameterService.update(id, updateParameterDto),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ParameterEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new ParameterEntity(await this.parameterService.remove(id));
  }
}
