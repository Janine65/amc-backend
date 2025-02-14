import { Test, TestingModule } from '@nestjs/testing';
import { AnlaesseService } from './anlaesse.service';

describe('AnlaesseService', () => {
  let service: AnlaesseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnlaesseService],
    }).compile();

    service = module.get<AnlaesseService>(AnlaesseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
