import { Test, TestingModule } from '@nestjs/testing';
import { TrackierService } from './trackier.service';

describe('TrackierService', () => {
  let service: TrackierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackierService],
    }).compile();

    service = module.get<TrackierService>(TrackierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
