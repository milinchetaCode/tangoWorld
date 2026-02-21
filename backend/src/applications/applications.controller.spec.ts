import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;

  const mockApplicationsService = {
    apply: jest.fn(),
    findAllForEvent: jest.fn(),
    findUserApplications: jest.fn(),
    updateStatus: jest.fn(),
    updatePayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [{ provide: ApplicationsService, useValue: mockApplicationsService }],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEventApplications', () => {
    it('should call findAllForEvent with eventId and userId from request', async () => {
      const eventId = 'event-123';
      const userId = 'organizer-456';
      const req = { user: { userId } };
      mockApplicationsService.findAllForEvent.mockResolvedValue([]);

      const result = await controller.getEventApplications(eventId, req);

      expect(mockApplicationsService.findAllForEvent).toHaveBeenCalledWith(eventId, userId);
      expect(result).toEqual([]);
    });
  });
});
