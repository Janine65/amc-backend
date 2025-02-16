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
import { RetDataDto, RetDataFileDto } from 'src/utils/ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('adressen')
export class AdressenController {
  constructor(private readonly adressenService: AdressenService) {}
  @Get('overview')
  @ApiOkResponse({ type: RetDataDto })
  async getOverview() {
    return new RetDataDto(
      await this.adressenService.getOverview(),
      'Adressen Overview',
      'info',
    );
  }

  @Get('getFkData')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async getFKData() {
    return new RetDataDto(
      await this.adressenService.getFKData(),
      'FK Data',
      'info',
    );
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
  @ApiCreatedResponse({ type: RetDataDto })
  async create(@Body() createAdressenDto: CreateAdressenDto) {
    const adr = await this.adressenService.create(createAdressenDto);
    if (adr === null) {
      throw new NotFoundException('Address not found');
    }
    return new RetDataDto(new AdressenEntity(adr), 'Address created', 'info');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findAll() {
    const addresses = await this.adressenService.findAll();
    return new RetDataDto(
      addresses.map((adr) => new AdressenEntity(adr)),
      'Addresses found',
      'info',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const adr = await this.adressenService.findOne(id);
    if (adr === null) {
      throw new NotFoundException('Address not found');
    }
    return new RetDataDto(new AdressenEntity(adr), 'Address found', 'info');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdressenDto: UpdateAdressenDto,
  ) {
    return new RetDataDto(
      new AdressenEntity(
        await this.adressenService.update(id, updateAdressenDto),
      ),
      'Address updated',
      'info',
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetDataDto })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new RetDataDto(
      new AdressenEntity(await this.adressenService.remove(id)),
      'Address deleted',
      'info',
    );
  }
}
