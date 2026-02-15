import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateCoordinates', () => {
    it('should update coordinates for an existing event', async () => {
      const eventId = 'test-event-id';
      const latitude = 48.8566;
      const longitude = 2.3522;
      const updatedEvent = {
        id: eventId,
        title: 'Test Event',
        latitude,
        longitude,
      };

      mockPrismaService.event.update.mockResolvedValue(updatedEvent);

      const result = await service.updateCoordinates(eventId, latitude, longitude);

      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: { latitude, longitude },
      });
      expect(result).toEqual(updatedEvent);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      const eventId = 'non-existent-id';
      const latitude = 48.8566;
      const longitude = 2.3522;

      mockPrismaService.event.update.mockRejectedValue({ code: 'P2025' });

      await expect(
        service.updateCoordinates(eventId, latitude, longitude),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw original error for other database errors', async () => {
      const eventId = 'test-event-id';
      const latitude = 48.8566;
      const longitude = 2.3522;
      const dbError = new Error('Database connection error');

      mockPrismaService.event.update.mockRejectedValue(dbError);

      await expect(
        service.updateCoordinates(eventId, latitude, longitude),
      ).rejects.toThrow(dbError);
    });
  });
});
