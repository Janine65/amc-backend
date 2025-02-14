import { Test, TestingModule } from '@nestjs/testing';
import { KegelkasseController } from './kegelkasse.controller';
import { KegelkasseService } from './kegelkasse.service';

describe('KegelkasseController', () => {
  let controller: KegelkasseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KegelkasseController],
      providers: [KegelkasseService],
    }).compile();

    controller = module.get<KegelkasseController>(KegelkasseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
