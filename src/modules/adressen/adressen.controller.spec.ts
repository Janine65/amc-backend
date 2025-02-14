import { Test, TestingModule } from '@nestjs/testing';
import { AdressenController } from './adressen.controller';
import { AdressenService } from './adressen.service';

describe('AdressenController', () => {
  let controller: AdressenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdressenController],
      providers: [AdressenService],
    }).compile();

    controller = module.get<AdressenController>(AdressenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
