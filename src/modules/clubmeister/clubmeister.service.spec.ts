import { Test, TestingModule } from '@nestjs/testing';
import { ClubmeisterService } from './clubmeister.service';

describe('ClubmeisterService', () => {
  let service: ClubmeisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClubmeisterService],
    }).compile();

    service = module.get<ClubmeisterService>(ClubmeisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
