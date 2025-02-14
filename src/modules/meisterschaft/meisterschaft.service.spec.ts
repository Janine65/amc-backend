import { Test, TestingModule } from '@nestjs/testing';
import { MeisterschaftService } from './meisterschaft.service';

describe('MeisterschaftService', () => {
  let service: MeisterschaftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeisterschaftService],
    }).compile();

    service = module.get<MeisterschaftService>(MeisterschaftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
