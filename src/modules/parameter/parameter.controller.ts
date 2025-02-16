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
import { RetDataDto } from 'src/utils/ret-data.dto';

@Controller('parameter')
@ApiTags('Parameter')
export class ParameterController {
  constructor(private readonly parameterService: ParameterService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RetDataDto })
  async create(@Body() createParameterDto: CreateParameterDto) {
    return new RetDataDto(
      new ParameterEntity(
        await this.parameterService.create(createParameterDto),
      ),
      'Parameter created',
      'info',
    );
  }

  @Get()
  @ApiOkResponse({ type: RetDataDto })
  async findAll() {
    const parameters: parameter[] = await this.parameterService.findAll();
    return new RetDataDto(
      parameters.map((parameter) => new ParameterEntity(parameter)),
      'Parameters found',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const paramRec = await this.parameterService.findOne(id);
    if (!paramRec) {
      throw new NotFoundException(`Parameter with ${id} does not exist.`);
    }
    return new RetDataDto(
      new ParameterEntity(paramRec),
      'Parameter found',
      'info',
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateParameterDto: UpdateParameterDto,
  ) {
    return new RetDataDto(
      new ParameterEntity(
        await this.parameterService.update(id, updateParameterDto),
      ),
      'Parameter updated',
      'info',
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new RetDataDto(
      new ParameterEntity(await this.parameterService.remove(id)),
      'Parameter removed',
      'info',
    );
  }
}
