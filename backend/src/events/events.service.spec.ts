import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

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
    application: {
      findUnique: jest.fn(),
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
        where: { isPublished: true },
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

    it('should filter events by organizerId and always apply isPublished filter', async () => {
      const organizerId = 'user-123';
      const mockEvents = [{ id: '1', title: 'Event 1', organizerId }];
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);

      const result = await service.findAll(undefined, organizerId);

      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: { isPublished: true, organizerId },
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
          isPublished: true,
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

    it('should filter events by both organizerId and search term, with isPublished', async () => {
      const search = 'tango';
      const organizerId = 'user-123';
      const mockEvents = [
        { id: '1', title: 'Tango Event', organizerId },
      ];
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);

      const result = await service.findAll(search, organizerId);

      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: {
          isPublished: true,
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

  describe('findOne', () => {
    it('should return event without contact field', async () => {
      const eventId = 'test-event-id';
      const mockEvent = {
        id: eventId,
        title: 'Test Event',
        contact: 'secret-contact@example.com',
        organizer: { name: 'John', surname: 'Doe', email: 'john@example.com' },
        applications: [],
      };
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne(eventId);

      expect(result).not.toHaveProperty('contact');
      expect(result).toHaveProperty('title', 'Test Event');
    });

    it('should return null when event not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findOneContact', () => {
    it('should return contact for an accepted user', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';

      mockPrismaService.application.findUnique.mockResolvedValue({ status: 'accepted' });
      mockPrismaService.event.findUnique.mockResolvedValue({ contact: 'contact@example.com' });

      const result = await service.findOneContact(eventId, userId);

      expect(result).toEqual({ contact: 'contact@example.com' });
    });

    it('should throw ForbiddenException for non-accepted user', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';

      mockPrismaService.application.findUnique.mockResolvedValue({ status: 'applied' });

      await expect(service.findOneContact(eventId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user has no application', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';

      mockPrismaService.application.findUnique.mockResolvedValue(null);

      await expect(service.findOneContact(eventId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete event when user is the organizer', async () => {
      const eventId = 'event-123';
      const userId = 'organizer-456';

      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: userId });
      mockPrismaService.event.delete.mockResolvedValue({ id: eventId });

      const result = await service.remove(eventId, userId);

      expect(prismaService.event.delete).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(result).toEqual({ id: eventId });
    });

    it('should throw ForbiddenException when user is not the organizer', async () => {
      const eventId = 'event-123';
      const userId = 'user-999';

      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: 'other-organizer' });

      await expect(service.remove(eventId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCoordinates', () => {
    it('should update coordinates when user is the organizer', async () => {
      const eventId = 'test-event-id';
      const latitude = 48.8566;
      const longitude = 2.3522;
      const userId = 'organizer-123';
      const updatedEvent = { id: eventId, title: 'Test Event', latitude, longitude };

      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: userId });
      mockPrismaService.event.update.mockResolvedValue(updatedEvent);

      const result = await service.updateCoordinates(eventId, latitude, longitude, userId);

      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: { latitude, longitude },
      });
      expect(result).toEqual(updatedEvent);
    });

    it('should throw ForbiddenException when user is not the organizer', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: 'other-organizer' });

      await expect(
        service.updateCoordinates('event-123', 48.8566, 2.3522, 'user-999'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCoordinates('non-existent-id', 48.8566, 2.3522, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw original error for other database errors', async () => {
      const dbError = new Error('Database connection error');

      mockPrismaService.event.findUnique.mockRejectedValue(dbError);

      await expect(
        service.updateCoordinates('test-event-id', 48.8566, 2.3522, 'user-123'),
      ).rejects.toThrow(dbError);
    });
  });

  describe('updatePublicationStatus', () => {
    it('should update publication status when user is the organizer', async () => {
      const eventId = 'event-123';
      const userId = 'organizer-456';

      mockPrismaService.event.findUnique.mockResolvedValue({
        id: eventId,
        organizerId: userId,
        applications: [],
      });
      mockPrismaService.event.update.mockResolvedValue({ id: eventId, isPublished: true });

      const result = await service.updatePublicationStatus(eventId, true, userId);

      expect(prismaService.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: eventId }, data: { isPublished: true } }),
      );
      expect(result).toEqual({ id: eventId, isPublished: true });
    });

    it('should throw ForbiddenException when user is not the organizer', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'event-123',
        organizerId: 'other-organizer',
        applications: [],
      });

      await expect(
        service.updatePublicationStatus('event-123', true, 'user-999'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when event not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePublicationStatus('non-existent', true, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
