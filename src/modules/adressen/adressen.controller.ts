import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AdressenService } from './adressen.service';
import { CreateAdressenDto } from './dto/create-adressen.dto';
import { UpdateAdressenDto } from './dto/update-adressen.dto';
import { FilterAdressenDto } from './dto/filter-adressen.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { AdressenEntity } from './entities/adressen.entity';
import { EmailBody } from './dto/email-body.dto';
import { OverviewDto } from './dto/overview.dto';
import { RetDataDto, RetDataFileDto } from 'src/utils/ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('adressen')
export class AdressenController {
  constructor(private readonly adressenService: AdressenService) {}
  @Get('overview')
  @ApiOkResponse({ type: OverviewDto, isArray: true })
  getOverview() {
    return this.adressenService.getOverview();
  }

  @Get('getFkData')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFKData() {
    return this.adressenService.getFKData();
  }

  @Post('export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataFileDto })
  async exportAdressen(@Body() filter: FilterAdressenDto) {
    return this.adressenService.exportAdressen(filter);
  }

  @Post('sendmail')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataDto })
  async sendEmail(@Body() emailBody: EmailBody) {
    return this.adressenService.sendEmail(emailBody);
  }

  @Get('qrbill:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: RetDataFileDto })
  async createQRBill(@Param('id', ParseIntPipe) id: number) {
    return await this.adressenService.createQRBill(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: AdressenEntity })
  async create(@Body() createAdressenDto: CreateAdressenDto) {
    const adr = await this.adressenService.create(createAdressenDto);
    if (adr === null) {
      throw new NotFoundException('Address not found');
    }
    return new AdressenEntity(adr);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AdressenEntity, isArray: true })
  async findAll() {
    const addresses = await this.adressenService.findAll();
    return addresses.map((adr) => new AdressenEntity(adr));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AdressenEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const adr = await this.adressenService.findOne(id);
    if (adr === null) {
      throw new NotFoundException('Address not found');
    }
    return new AdressenEntity(adr);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AdressenEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdressenDto: UpdateAdressenDto,
  ) {
    return new AdressenEntity(
      await this.adressenService.update(id, updateAdressenDto),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AdressenEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new AdressenEntity(await this.adressenService.remove(id));
  }
}
