import { Test, TestingModule } from '@nestjs/testing';
import { JournalReceiptService } from './journal-receipt.service';

describe('JournalReceiptService', () => {
  let service: JournalReceiptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JournalReceiptService],
    }).compile();

    service = module.get<JournalReceiptService>(JournalReceiptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
