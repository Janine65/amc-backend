import { Test, TestingModule } from '@nestjs/testing';
import { KegelmeisterService } from './kegelmeister.service';

describe('KegelmeisterService', () => {
  let service: KegelmeisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KegelmeisterService],
    }).compile();

    service = module.get<KegelmeisterService>(KegelmeisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
