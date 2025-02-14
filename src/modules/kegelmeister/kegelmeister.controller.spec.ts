import { Test, TestingModule } from '@nestjs/testing';
import { KegelmeisterController } from './kegelmeister.controller';
import { KegelmeisterService } from './kegelmeister.service';

describe('KegelmeisterController', () => {
  let controller: KegelmeisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KegelmeisterController],
      providers: [KegelmeisterService],
    }).compile();

    controller = module.get<KegelmeisterController>(KegelmeisterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
