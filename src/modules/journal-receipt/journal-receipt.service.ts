import { Injectable } from '@nestjs/common';
import { CreateJournalReceiptDto } from './dto/create-journal-receipt.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReceiptEntity } from '../receipt/entities/receipt.entity';
import { journal_receipt } from '@prisma/client';

@Injectable()
export class JournalReceiptService {
  constructor(private prisma: PrismaService) {}

  create(
    createJournalReceiptDto: CreateJournalReceiptDto,
  ): Promise<journal_receipt> {
    return this.prisma.journal_receipt.create({
      data: createJournalReceiptDto,
    });
  }

  add2journal(journalid: number, receipts: ReceiptEntity[]): Promise<any> {
    const data: journal_receipt[] = [];
    receipts.forEach((receipt) => {
      data.push({
        journalid: journalid,
        receiptid: receipt.id,
      });
    });
    return this.prisma.journal_receipt.createMany({
      data: data,
    });
  }

  findAll(): Promise<journal_receipt[]> {
    return this.prisma.journal_receipt.findMany();
  }

  findAllByReceipt(receiptid: number): Promise<journal_receipt[]> {
    return this.prisma.journal_receipt.findMany({
      where: { receiptid: receiptid },
    });
  }

  findAllByJournal(journalid: number): Promise<journal_receipt[]> {
    return this.prisma.journal_receipt.findMany({
      where: { journalid: journalid },
    });
  }

  remove(journalid: number, receiptid: number): Promise<any> {
    return this.prisma.journal_receipt.deleteMany({
      where: {
        AND: [{ journalid: journalid }, { receiptid: receiptid }],
      },
    });
  }
}
