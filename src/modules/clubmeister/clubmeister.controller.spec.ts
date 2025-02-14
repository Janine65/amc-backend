import { Test, TestingModule } from '@nestjs/testing';
import { ClubmeisterController } from './clubmeister.controller';
import { ClubmeisterService } from './clubmeister.service';

describe('ClubmeisterController', () => {
  let controller: ClubmeisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubmeisterController],
      providers: [ClubmeisterService],
    }).compile();

    controller = module.get<ClubmeisterController>(ClubmeisterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
