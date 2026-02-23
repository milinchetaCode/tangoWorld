import { Test, TestingModule } from '@nestjs/testing';
import { EventCostsService } from './event-costs.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('EventCostsService', () => {
  let service: EventCostsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    event: {
      findUnique: jest.fn(),
    },
    eventCost: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    application: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventCostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventCostsService>(EventCostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new event cost when user is the organizer', async () => {
      const eventId = 'event-123';
      const userId = 'organizer-456';
      const costData = {
        category: 'rent',
        description: 'Venue rental',
        amount: 1000,
        date: new Date('2024-01-15'),
      };
      const expectedResult = { id: 'cost-123', eventId, ...costData };

      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: userId });
      mockPrismaService.eventCost.create.mockResolvedValue(expectedResult);

      const result = await service.create(eventId, costData, userId);

      expect(prisma.eventCost.create).toHaveBeenCalledWith({
        data: {
          ...costData,
          event: { connect: { id: eventId } },
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw ForbiddenException when user is not the organizer', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: 'other-organizer' });

      const costData = { category: 'rent', description: 'test', amount: 100, date: new Date() };
      await expect(
        service.create('event-123', costData, 'user-999'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when event not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      const costData = { category: 'rent', description: 'test', amount: 100, date: new Date() };
      await expect(
        service.create('non-existent', costData, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByEventId', () => {
    it('should return all costs for an event when user is the organizer', async () => {
      const eventId = 'event-123';
      const userId = 'organizer-456';
      const expectedCosts = [
        { id: 'cost-1', eventId, category: 'rent', amount: 1000 },
        { id: 'cost-2', eventId, category: 'insurance', amount: 500 },
      ];

      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: userId });
      mockPrismaService.eventCost.findMany.mockResolvedValue(expectedCosts);

      const result = await service.findAllByEventId(eventId, userId);

      expect(prisma.eventCost.findMany).toHaveBeenCalledWith({
        where: { eventId },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual(expectedCosts);
    });

    it('should throw ForbiddenException when user is not the organizer', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: 'other-organizer' });

      await expect(service.findAllByEventId('event-123', 'user-999')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a cost when user is the organizer', async () => {
      const costId = 'cost-123';
      const eventId = 'event-456';
      const userId = 'organizer-789';
      const expectedResult = { id: costId };

      mockPrismaService.eventCost.findUnique.mockResolvedValue({ eventId });
      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: userId });
      mockPrismaService.eventCost.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(costId, userId);

      expect(prisma.eventCost.delete).toHaveBeenCalledWith({
        where: { id: costId },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when cost not found', async () => {
      mockPrismaService.eventCost.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the organizer', async () => {
      mockPrismaService.eventCost.findUnique.mockResolvedValue({ eventId: 'event-123' });
      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: 'other-organizer' });

      await expect(service.remove('cost-123', 'user-999')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getBusinessDashboardData', () => {
    it('should calculate business dashboard metrics correctly when user is the organizer', async () => {
      const eventId = 'event-123';
      const userId = 'organizer-456';

      const mockCosts = [
        { id: 'cost-1', category: 'rent', amount: 1000, date: new Date() },
        { id: 'cost-2', category: 'insurance', amount: 500, date: new Date() },
      ];

      const mockApplications = [
        {
          id: 'app-1',
          status: 'accepted',
          paymentDone: true,
          totalPrice: 200,
          user: { name: 'John', surname: 'Doe', email: 'john@example.com' },
        },
        {
          id: 'app-2',
          status: 'accepted',
          paymentDone: false,
          totalPrice: 200,
          user: { name: 'Jane', surname: 'Doe', email: 'jane@example.com' },
        },
        {
          id: 'app-3',
          status: 'waitlisted',
          paymentDone: false,
          totalPrice: 200,
          user: { name: 'Bob', surname: 'Smith', email: 'bob@example.com' },
        },
      ];

      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: userId });
      mockPrismaService.eventCost.findMany.mockResolvedValue(mockCosts);
      mockPrismaService.application.findMany.mockResolvedValue(mockApplications);

      const result = await service.getBusinessDashboardData(eventId, userId);

      expect(result.totalCosts).toBe(1500);
      expect(result.confirmedRevenue).toBe(200);
      expect(result.theoreticalRevenue).toBe(400);
      expect(result.pendingRevenue).toBe(200);
      expect(result.netProfitConfirmed).toBe(-1300);
      expect(result.netProfitTheoretical).toBe(-1100);
      expect(result.paymentCompletionRate).toBe(50);
      expect(result.totalAcceptedApplications).toBe(2);
      expect(result.paidApplications).toBe(1);
      expect(result.costsByCategory).toEqual({
        rent: 1000,
        insurance: 500,
      });
    });

    it('should handle events with no costs or applications', async () => {
      const eventId = 'event-123';
      const userId = 'organizer-456';

      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: userId });
      mockPrismaService.eventCost.findMany.mockResolvedValue([]);
      mockPrismaService.application.findMany.mockResolvedValue([]);

      const result = await service.getBusinessDashboardData(eventId, userId);

      expect(result.totalCosts).toBe(0);
      expect(result.confirmedRevenue).toBe(0);
      expect(result.theoreticalRevenue).toBe(0);
      expect(result.pendingRevenue).toBe(0);
      expect(result.paymentCompletionRate).toBe(0);
      expect(result.costsByCategory).toEqual({});
    });

    it('should throw ForbiddenException when user is not the organizer', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({ organizerId: 'other-organizer' });

      await expect(
        service.getBusinessDashboardData('event-123', 'user-999'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
