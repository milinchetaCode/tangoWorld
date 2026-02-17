import { Test, TestingModule } from '@nestjs/testing';
import {
  EventCostsController,
  BusinessDashboardController,
} from './event-costs.controller';
import { EventCostsService } from './event-costs.service';

describe('EventCostsController', () => {
  let controller: EventCostsController;
  let service: EventCostsService;

  const mockEventCostsService = {
    create: jest.fn(),
    findAllByEventId: jest.fn(),
    remove: jest.fn(),
    getBusinessDashboardData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventCostsController],
      providers: [
        {
          provide: EventCostsService,
          useValue: mockEventCostsService,
        },
      ],
    }).compile();

    controller = module.get<EventCostsController>(EventCostsController);
    service = module.get<EventCostsService>(EventCostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cost', async () => {
      const eventId = 'event-123';
      const body = {
        category: 'rent',
        description: 'Venue rental',
        amount: 1000,
        date: '2024-01-15',
      };
      const expectedResult = { id: 'cost-123', ...body };

      mockEventCostsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(eventId, body);

      expect(service.create).toHaveBeenCalledWith({
        event: { connect: { id: eventId } },
        category: body.category,
        description: body.description,
        amount: body.amount,
        date: new Date(body.date),
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a cost with current date when no date provided', async () => {
      const eventId = 'event-123';
      const body = {
        category: 'insurance',
        description: 'Event insurance',
        amount: 500,
      };

      mockEventCostsService.create.mockResolvedValue({});

      await controller.create(eventId, body);

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          event: { connect: { id: eventId } },
          category: body.category,
          description: body.description,
          amount: body.amount,
          date: expect.any(Date),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all costs for an event', async () => {
      const eventId = 'event-123';
      const expectedCosts = [
        { id: 'cost-1', category: 'rent', amount: 1000 },
        { id: 'cost-2', category: 'insurance', amount: 500 },
      ];

      mockEventCostsService.findAllByEventId.mockResolvedValue(expectedCosts);

      const result = await controller.findAll(eventId);

      expect(service.findAllByEventId).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(expectedCosts);
    });
  });

  describe('remove', () => {
    it('should delete a cost', async () => {
      const costId = 'cost-123';
      const expectedResult = { id: costId };

      mockEventCostsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(costId);

      expect(service.remove).toHaveBeenCalledWith(costId);
      expect(result).toEqual(expectedResult);
    });
  });
});

describe('BusinessDashboardController', () => {
  let controller: BusinessDashboardController;
  let service: EventCostsService;

  const mockEventCostsService = {
    create: jest.fn(),
    findAllByEventId: jest.fn(),
    remove: jest.fn(),
    getBusinessDashboardData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessDashboardController],
      providers: [
        {
          provide: EventCostsService,
          useValue: mockEventCostsService,
        },
      ],
    }).compile();

    controller = module.get<BusinessDashboardController>(
      BusinessDashboardController,
    );
    service = module.get<EventCostsService>(EventCostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBusinessDashboard', () => {
    it('should return business dashboard data for an event', async () => {
      const eventId = 'event-123';
      const expectedData = {
        costs: [],
        costsByCategory: {},
        totalCosts: 1500,
        confirmedRevenue: 5000,
        theoreticalRevenue: 8000,
        pendingRevenue: 3000,
        netProfitConfirmed: 3500,
        netProfitTheoretical: 6500,
        paymentCompletionRate: 62.5,
        totalAcceptedApplications: 40,
        paidApplications: 25,
      };

      mockEventCostsService.getBusinessDashboardData.mockResolvedValue(
        expectedData,
      );

      const result = await controller.getBusinessDashboard(eventId);

      expect(service.getBusinessDashboardData).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(expectedData);
    });
  });
});
