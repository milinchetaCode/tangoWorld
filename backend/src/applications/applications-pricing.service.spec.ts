import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ApplicationsService - Pricing', () => {
  let service: ApplicationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    event: {
      findUnique: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('apply with pricing', () => {
    it('should create application with pricing information', async () => {
      const userId = 'user-id';
      const eventId = 'event-id';
      const pricingData = {
        pricingOption: 'full_food',
        totalPrice: 150.00,
      };

      const mockEvent = {
        id: eventId,
        capacity: 100,
        maleCapacity: 50,
        femaleCapacity: 50,
        applications: [],
      };

      const mockUser = {
        id: userId,
        gender: 'male',
      };

      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.application.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app-id',
        userId,
        eventId,
        status: 'applied',
        pricingOption: pricingData.pricingOption,
        totalPrice: pricingData.totalPrice,
      });

      const result = await service.apply(userId, eventId, pricingData);

      expect(result).toBeDefined();
      expect(mockPrismaService.application.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: userId } },
          event: { connect: { id: eventId } },
          pricingOption: pricingData.pricingOption,
          totalPrice: pricingData.totalPrice,
        }),
      });
    });

    it('should create application with daily pricing and number of days', async () => {
      const userId = 'user-id';
      const eventId = 'event-id';
      const pricingData = {
        pricingOption: 'daily_food',
        numberOfDays: 3,
        totalPrice: 180.00,
      };

      const mockEvent = {
        id: eventId,
        capacity: 100,
        maleCapacity: 50,
        femaleCapacity: 50,
        applications: [],
      };

      const mockUser = {
        id: userId,
        gender: 'female',
      };

      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.application.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app-id',
        userId,
        eventId,
        status: 'applied',
        pricingOption: pricingData.pricingOption,
        numberOfDays: pricingData.numberOfDays,
        totalPrice: pricingData.totalPrice,
      });

      const result = await service.apply(userId, eventId, pricingData);

      expect(result).toBeDefined();
      expect(mockPrismaService.application.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: userId } },
          event: { connect: { id: eventId } },
          pricingOption: pricingData.pricingOption,
          numberOfDays: pricingData.numberOfDays,
          totalPrice: pricingData.totalPrice,
        }),
      });
    });

    it('should create application without pricing when not provided', async () => {
      const userId = 'user-id';
      const eventId = 'event-id';

      const mockEvent = {
        id: eventId,
        capacity: 100,
        maleCapacity: 50,
        femaleCapacity: 50,
        applications: [],
      };

      const mockUser = {
        id: userId,
        gender: 'male',
      };

      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.application.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app-id',
        userId,
        eventId,
        status: 'applied',
      });

      const result = await service.apply(userId, eventId);

      expect(result).toBeDefined();
      expect(mockPrismaService.application.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: userId } },
          event: { connect: { id: eventId } },
          status: 'applied',
        },
      });
    });
  });
});
