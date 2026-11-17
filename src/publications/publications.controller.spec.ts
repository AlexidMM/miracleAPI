import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { BadRequestException } from '@nestjs/common';

describe('PublicationsController WhiteBox Tests (WEB-01, WEB-02)', () => {
  let controller: PublicationsController;
  let service: PublicationsService;

  const mockPublicationsService = {
    findNearby: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicationsController],
      providers: [
        { provide: PublicationsService, useValue: mockPublicationsService },
      ],
    }).compile();

    controller = module.get<PublicationsController>(PublicationsController);
    service = module.get<PublicationsService>(PublicationsService);
  });

  it('WEB-01: Debe procesar latitud y longitud válidas y llamar al servicio', async () => {
    await controller.findNearby('20.5888', '-100.3899', '10');
    expect(service.findNearby).toHaveBeenCalledWith(20.5888, -100.3899, 10);
  });

  it('WEB-02: Debe rechazar latitud alfanumérica y lanzar BadRequestException (HTTP 400)', () => {
    expect(() => controller.findNearby('abc', '-100.3899', '10')).toThrow(BadRequestException);
  });

  it('WEB-02: Debe rechazar coordenadas fuera de rango (lat > 90)', () => {
    expect(() => controller.findNearby('95.0000', '-100.3899', '10')).toThrow(BadRequestException);
  });
});