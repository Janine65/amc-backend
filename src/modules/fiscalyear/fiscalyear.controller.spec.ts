import { Test, TestingModule } from '@nestjs/testing';
import { FiscalyearController } from './fiscalyear.controller';
import { FiscalyearService } from './fiscalyear.service';

describe('FiscalyearController', () => {
  let controller: FiscalyearController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiscalyearController],
      providers: [FiscalyearService],
    }).compile();

    controller = module.get<FiscalyearController>(FiscalyearController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
