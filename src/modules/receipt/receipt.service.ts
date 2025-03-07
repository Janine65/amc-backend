import { Injectable } from '@nestjs/common';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { receipt } from '@prisma/client';
import { RetDataFilesDto } from 'src/utils/ret-data.dto';
import { ConfigService } from 'src/config/config.service';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from 'fs';

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(year: string, uploadFiles: string): Promise<RetDataFilesDto> {
    const path = this.configService.documents + year + '/';
    if (!existsSync(path)) {
      mkdirSync(path);
      mkdirSync(path + '/receipt');
    }

    const uploadfiles = uploadFiles.split(',');
    const payload: RetDataFilesDto = {
      type: 'info',
      message: '',
      data: { files: [] },
    };

    await Promise.all(
      uploadfiles.map(async (uploadfile) => {
        const receiptPath = 'receipt/' + uploadfile;
        const filename = this.configService.uploads + uploadfile;

        if (existsSync(filename)) {
          // create receipt
          const recRec = await this.prisma.receipt.create({
            data: {
              receipt: receiptPath,
              createdAt: new Date(),
              updatedAt: new Date(),
              jahr: year,
              bezeichnung: uploadfile,
            },
          });

          // copy file
          const newFilename = 'receipt/journal-' + recRec.id + '.pdf';
          await this.prisma.receipt.update({
            data: { receipt: newFilename },
            where: { id: recRec.id },
          });
          copyFileSync(filename, path + newFilename);
          payload.data!.files.push(newFilename);
          chmodSync(path + newFilename, '0640');
        } else {
          payload.message +=
            'Error while reading the file ' + uploadfile + '; ';
          payload.type = 'error';
        }
      }),
    );

    return payload;
  }

  async findAll(year: string): Promise<receipt[]> {
    const findReceipts = await this.prisma.receipt.findMany({
      where: { jahr: year },
      include: { journal_receipt: true },
      orderBy: { bezeichnung: 'asc' },
    });
    const pathname = this.configService.documents + year + '/';
    try {
      readdirSync(this.configService.uploads + 'receipt/');
    } catch (error) {
      console.log(error);
      mkdirSync(this.configService.uploads + 'receipt/');
    }
    findReceipts.forEach((rec) => {
      try {
        copyFileSync(
          pathname + rec.receipt,
          this.configService.uploads + rec.receipt,
        );
      } catch {
        // allow empty catch
        console.log(pathname + rec.receipt + ': File not found');
        rec.receipt = 'File not found: ' + rec.receipt;
      }
    });

    return findReceipts;
  }

  findAllAttachments(
    jahr: string,
    journalId: string | undefined,
  ): Promise<receipt[]> {
    if (journalId === undefined) {
      return this.prisma.receipt.findMany({
        where: { jahr: jahr, journal_receipt: { some: {} } },
        include: {
          journal_receipt: true,
        },
        orderBy: { bezeichnung: 'asc' },
      });
    } else {
      return this.prisma.receipt.findMany({
        where: {
          jahr: jahr,
          journal_receipt: { some: { journalid: Number(journalId) } },
        },
        include: {
          journal_receipt: true,
        },
        orderBy: { bezeichnung: 'asc' },
      });
    }
  }

  findAttachments(journalId: number): Promise<receipt[]> {
    return this.prisma.receipt.findMany({
      where: { journal_receipt: { some: { journalid: journalId } } },
      include: { journal_receipt: true },
      orderBy: { bezeichnung: 'asc' },
    });
  }

  findOne(id: number): Promise<receipt | null> {
    return this.prisma.receipt.findUnique({ where: { id: id } });
  }

  async add2journal(
    year: string,
    journalId: number,
    files: string,
  ): Promise<RetDataFilesDto> {
    const payload: RetDataFilesDto = {
      type: 'info',
      message: '',
      data: { files: [] },
    };

    const path = this.configService.documents + year + '/';
    if (!existsSync(path)) {
      mkdirSync(path);
      mkdirSync(path + '/receipt');
    }

    const uploadfiles = files.split(',');
    await Promise.all(
      uploadfiles.map(async (uploadfile) => {
        const receiptPath = 'receipt/' + uploadfile;
        const filename = this.configService.uploads + uploadfile;

        if (existsSync(filename)) {
          // create receipt
          const newReceipt = await this.prisma.receipt.create({
            data: {
              receipt: receiptPath,
              createdAt: new Date(),
              updatedAt: new Date(),
              jahr: year,
              bezeichnung: uploadfile,
              journal_receipt: {
                create: {
                  journalid: journalId,
                },
              },
            },
          });
          const newFilename = 'receipt/journal-' + newReceipt.id + '.pdf';
          newReceipt.receipt = newFilename;
          await this.prisma.receipt.update({
            where: { id: newReceipt.id },
            data: { receipt: newFilename },
          });
          copyFileSync(filename, path + newFilename);
          payload.data!.files.push(newFilename);
          chmodSync(path + newFilename, '0640');
        } else {
          payload.message +=
            'Error while reading the file ' + uploadfile + '; ';
          payload.type = 'error';
        }
      }),
    );

    return payload;
  }

  update(id: number, updateReceiptDto: UpdateReceiptDto): Promise<receipt> {
    return this.prisma.receipt.update({
      data: { ...updateReceiptDto, updatedAt: new Date() },
      where: { id: id },
    });
  }

  remove(id: number): Promise<receipt> {
    return this.prisma.receipt.delete({ where: { id: id } });
  }
}
