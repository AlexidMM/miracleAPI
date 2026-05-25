import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { describe, beforeEach, it } from 'node:test';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationsService],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
function expect(service: ApplicationsService) {
  throw new Error('Function not implemented.');
}

