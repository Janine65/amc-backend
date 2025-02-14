import { Test, TestingModule } from '@nestjs/testing';
import { AdressenService } from './adressen.service';

describe('AdressenService', () => {
  let service: AdressenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdressenService],
    }).compile();

    service = module.get<AdressenService>(AdressenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
