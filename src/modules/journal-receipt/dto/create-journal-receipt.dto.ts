import { IsNumber } from 'class-validator';

export class CreateJournalReceiptDto {
  @IsNumber()
  journalid: number;

  @IsNumber()
  receiptid: number;
}
