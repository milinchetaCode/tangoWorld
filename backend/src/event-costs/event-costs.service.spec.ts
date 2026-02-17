import { Test, TestingModule } from '@nestjs/testing';
import { EventCostsService } from './event-costs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventCostsService', () => {
  let service: EventCostsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    eventCost: {
      create: jest.fn(),
      findMany: jest.fn(),
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
    it('should create a new event cost', async () => {
      const costData = {
        event: { connect: { id: 'event-123' } },
        category: 'rent',
        description: 'Venue rental',
        amount: 1000,
      };
      const expectedResult = { id: 'cost-123', ...costData };

      mockPrismaService.eventCost.create.mockResolvedValue(expectedResult);

      const result = await service.create(costData);

      expect(prisma.eventCost.create).toHaveBeenCalledWith({ data: costData });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllByEventId', () => {
    it('should return all costs for an event', async () => {
      const eventId = 'event-123';
      const expectedCosts = [
        { id: 'cost-1', eventId, category: 'rent', amount: 1000 },
        { id: 'cost-2', eventId, category: 'insurance', amount: 500 },
      ];

      mockPrismaService.eventCost.findMany.mockResolvedValue(expectedCosts);

      const result = await service.findAllByEventId(eventId);

      expect(prisma.eventCost.findMany).toHaveBeenCalledWith({
        where: { eventId },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual(expectedCosts);
    });
  });

  describe('remove', () => {
    it('should delete a cost', async () => {
      const costId = 'cost-123';
      const expectedResult = { id: costId };

      mockPrismaService.eventCost.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(costId);

      expect(prisma.eventCost.delete).toHaveBeenCalledWith({
        where: { id: costId },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getBusinessDashboardData', () => {
    it('should calculate business dashboard metrics correctly', async () => {
      const eventId = 'event-123';

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

      mockPrismaService.eventCost.findMany.mockResolvedValue(mockCosts);
      mockPrismaService.application.findMany.mockResolvedValue(
        mockApplications,
      );

      const result = await service.getBusinessDashboardData(eventId);

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

      mockPrismaService.eventCost.findMany.mockResolvedValue([]);
      mockPrismaService.application.findMany.mockResolvedValue([]);

      const result = await service.getBusinessDashboardData(eventId);

      expect(result.totalCosts).toBe(0);
      expect(result.confirmedRevenue).toBe(0);
      expect(result.theoreticalRevenue).toBe(0);
      expect(result.pendingRevenue).toBe(0);
      expect(result.paymentCompletionRate).toBe(0);
      expect(result.costsByCategory).toEqual({});
    });
  });
});
