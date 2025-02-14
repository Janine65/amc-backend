import { Test, TestingModule } from '@nestjs/testing';
import { KegelkasseService } from './kegelkasse.service';

describe('KegelkasseService', () => {
  let service: KegelkasseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KegelkasseService],
    }).compile();

    service = module.get<KegelkasseService>(KegelkasseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
