import { Test, TestingModule } from '@nestjs/testing';
import { JournalReceiptController } from './journal-receipt.controller';
import { JournalReceiptService } from './journal-receipt.service';

describe('JournalReceiptController', () => {
  let controller: JournalReceiptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalReceiptController],
      providers: [JournalReceiptService],
    }).compile();

    controller = module.get<JournalReceiptController>(JournalReceiptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
