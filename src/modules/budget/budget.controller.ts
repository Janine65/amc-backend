import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ConflictException,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { RetDataDto } from 'src/utils/ret-data.dto';
import { BudgetEntity } from './entities/budget.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}
  @Put('copyyear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async copyYear(
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
  ) {
    const budgets = await this.budgetService.copyYear(from, to);
    return new RetDataDto(
      budgets.map((budget) => new BudgetEntity(budget)),
      'Budgets copied',
      'info',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RetDataDto })
  async create(@Body() createBudgetDto: CreateBudgetDto) {
    const budget = await this.budgetService.create(createBudgetDto);
    if (!budget) {
      throw new ConflictException('Budget already exists');
    }
    return new RetDataDto(new BudgetEntity(budget), 'Budget created', 'info');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findAll(@Query('year', ParseIntPipe) year: number) {
    const budgets = await this.budgetService.findAll(year);
    return new RetDataDto(
      budgets.map((budget) => new BudgetEntity(budget)),
      'Budgets found',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const budget = await this.budgetService.findOne(id);
    if (!budget) {
      return new RetDataDto(undefined, 'findOne', 'info');
    }
    return new RetDataDto(new BudgetEntity(budget), 'Budget found', 'info');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    const budget = await this.budgetService.update(id, updateBudgetDto);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return new RetDataDto(new BudgetEntity(budget), 'Budget updated', 'info');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const budget = await this.budgetService.remove(id);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return new RetDataDto(new BudgetEntity(budget), 'Budget removed', 'info');
  }
}
