import { Test, TestingModule } from '@nestjs/testing';
import { AnlaesseController } from './anlaesse.controller';
import { AnlaesseService } from './anlaesse.service';

describe('AnlaesseController', () => {
  let controller: AnlaesseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnlaesseController],
      providers: [AnlaesseService],
    }).compile();

    controller = module.get<AnlaesseController>(AnlaesseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
