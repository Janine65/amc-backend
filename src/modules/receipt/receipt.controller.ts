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
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { ReceiptEntity } from './entities/receipt.entity';
import { ConfigService } from 'src/config/config.service';
import { createReadStream } from 'fs';
import { join } from 'path';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { RetDataDto, RetDataFilesDto } from 'src/utils/ret-data.dto';
import { UploadFilesDto } from './dto/upload_files.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('receipt')
export class ReceiptController {
  constructor(
    private readonly receiptService: ReceiptService,
    private configService: ConfigService,
  ) {}

  @Post()
  @ApiOkResponse({ type: RetDataFilesDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() data: UploadFilesDto) {
    return this.receiptService.create(data.year, data.uploadfiles);
  }

  @Get('findallatt')
  @ApiOkResponse({ type: RetDataDto })
  @ApiQuery({
    name: 'journalid',
    type: String,
    description: 'JournalId. Optional',
    required: false,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAllAttachments(
    @Query('jahr') jahr: string,
    @Query('journalId') journalId?: string,
  ) {
    const receipts = await this.receiptService.findAllAttachments(
      jahr,
      journalId,
    );
    return new RetDataDto(
      receipts.map((receipt) => new ReceiptEntity(receipt)),
      'findAllAttachments',
      'info',
    );
  }

  @Get('findatt')
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAttachments(@Query('journalid', ParseIntPipe) journalId: number) {
    const receipts = await this.receiptService.findAttachments(journalId);
    return new RetDataDto(
      receipts.map((receipt) => new ReceiptEntity(receipt)),
      'findAttachments',
      'info',
    );
  }

  @Get('uploadatt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StreamableFile })
  uploadAtt(@Query('filename') filename: string) {
    const file = createReadStream(join(this.configService.uploads, filename));
    return new StreamableFile(file);
  }

  @Post('att2journal')
  @ApiOkResponse({ type: RetDataFilesDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addAttachment2Journal(@Body() data: UploadFilesDto) {
    if (data.uploadfiles && data.uploadfiles.length > 0) {
      return await this.receiptService.add2journal(
        data.year,
        data.journalId!,
        data.uploadfiles,
      );
    } else {
      return { type: 'info', message: 'No files to add' };
    }
  }

  @Get()
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(@Query('year') year: string) {
    const receipts = await this.receiptService.findAll(year);
    return new RetDataDto(
      receipts.map((receipt) => new ReceiptEntity(receipt)),
      'findAll',
      'info',
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return new RetDataDto(this.receiptService.findOne(id), 'findOne', 'info');
  }

  @Patch(':id')
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReceiptDto: UpdateReceiptDto,
  ) {
    const receipt = await this.receiptService.update(id, updateReceiptDto);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }
    return new RetDataDto(new ReceiptEntity(receipt), 'update', 'info');
  }

  @Delete(':id')
  @ApiOkResponse({ type: RetDataDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number) {
    const receipt = await this.receiptService.findOne(id);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }
    await this.receiptService.remove(id);
    return new RetDataDto(new ReceiptEntity(receipt), 'remove', 'info');
  }
}
