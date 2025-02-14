import { Test, TestingModule } from '@nestjs/testing';
import { FiscalyearService } from './fiscalyear.service';

describe('FiscalyearService', () => {
  let service: FiscalyearService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FiscalyearService],
    }).compile();

    service = module.get<FiscalyearService>(FiscalyearService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
