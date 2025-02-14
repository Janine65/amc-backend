import { Test, TestingModule } from '@nestjs/testing';
import { ParameterService } from './parameter.service';

describe('ParameterService', () => {
  let service: ParameterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParameterService],
    }).compile();

    service = module.get<ParameterService>(ParameterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
