import { Test, TestingModule } from '@nestjs/testing';
import { MeisterschaftController } from './meisterschaft.controller';
import { MeisterschaftService } from './meisterschaft.service';

describe('MeisterschaftController', () => {
  let controller: MeisterschaftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeisterschaftController],
      providers: [MeisterschaftService],
    }).compile();

    controller = module.get<MeisterschaftController>(MeisterschaftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
