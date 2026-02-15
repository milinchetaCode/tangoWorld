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

  describe('findAll', () => {
    it('should return all events when no filters provided', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' },
      ];
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);

      const result = await service.findAll();

      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          organizer: {
            select: {
              name: true,
              surname: true,
            },
          },
          applications: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
      expect(result).toEqual(mockEvents);
    });

    it('should filter events by organizerId', async () => {
      const organizerId = 'user-123';
      const mockEvents = [{ id: '1', title: 'Event 1', organizerId }];
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);

      const result = await service.findAll(undefined, organizerId);

      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: { organizerId },
        include: {
          organizer: {
            select: {
              name: true,
              surname: true,
            },
          },
          applications: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
      expect(result).toEqual(mockEvents);
    });

    it('should filter events by search term', async () => {
      const search = 'tango';
      const mockEvents = [{ id: '1', title: 'Tango Event' }];
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);

      const result = await service.findAll(search);

      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { venue: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: {
          organizer: {
            select: {
              name: true,
              surname: true,
            },
          },
          applications: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
      expect(result).toEqual(mockEvents);
    });

    it('should filter events by both organizerId and search term', async () => {
      const search = 'tango';
      const organizerId = 'user-123';
      const mockEvents = [
        { id: '1', title: 'Tango Event', organizerId },
      ];
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);

      const result = await service.findAll(search, organizerId);

      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: {
          organizerId,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { venue: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: {
          organizer: {
            select: {
              name: true,
              surname: true,
            },
          },
          applications: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
      expect(result).toEqual(mockEvents);
    });
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
