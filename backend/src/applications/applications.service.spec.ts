import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockPrismaService = {
    event: { findUnique: jest.fn() },
    application: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForEvent', () => {
    const eventId = 'event-123';
    const organizerId = 'organizer-456';

    it('should throw NotFoundException when event does not exist', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(service.findAllForEvent(eventId, organizerId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when caller is not the organizer', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: 'other-organizer' });

      await expect(
        service.findAllForEvent(eventId, organizerId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return applications when caller is the organizer', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId });
      mockPrismaService.application.findMany.mockResolvedValue([]);

      const result = await service.findAllForEvent(eventId, organizerId);

      expect(result).toEqual([]);
    });
  });
});
