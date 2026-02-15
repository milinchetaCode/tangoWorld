import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { BadRequestException } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEventsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateCoordinates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCoordinates', () => {
    it('should update coordinates with valid data', async () => {
      const eventId = 'test-event-id';
      const body = { latitude: 48.8566, longitude: 2.3522 };
      const updatedEvent = { id: eventId, ...body };

      mockEventsService.updateCoordinates.mockResolvedValue(updatedEvent);

      const result = await controller.updateCoordinates(eventId, body);

      expect(service.updateCoordinates).toHaveBeenCalledWith(
        eventId,
        body.latitude,
        body.longitude,
      );
      expect(result).toEqual(updatedEvent);
    });

    it('should throw BadRequestException for invalid latitude (too low)', () => {
      const eventId = 'test-event-id';
      const body = { latitude: -91, longitude: 2.3522 };

      expect(() => controller.updateCoordinates(eventId, body)).toThrow(
        BadRequestException,
      );
      expect(() => controller.updateCoordinates(eventId, body)).toThrow(
        'Latitude must be between -90 and 90',
      );
    });

    it('should throw BadRequestException for invalid latitude (too high)', () => {
      const eventId = 'test-event-id';
      const body = { latitude: 91, longitude: 2.3522 };

      expect(() => controller.updateCoordinates(eventId, body)).toThrow(
        BadRequestException,
      );
      expect(() => controller.updateCoordinates(eventId, body)).toThrow(
        'Latitude must be between -90 and 90',
      );
    });

    it('should throw BadRequestException for invalid longitude (too low)', () => {
      const eventId = 'test-event-id';
      const body = { latitude: 48.8566, longitude: -181 };

      expect(() => controller.updateCoordinates(eventId, body)).toThrow(
        BadRequestException,
      );
      expect(() => controller.updateCoordinates(eventId, body)).toThrow(
        'Longitude must be between -180 and 180',
      );
    });

    it('should throw BadRequestException for invalid longitude (too high)', () => {
      const eventId = 'test-event-id';
      const body = { latitude: 48.8566, longitude: 181 };

      expect(() => controller.updateCoordinates(eventId, body)).toThrow(
        BadRequestException,
      );
      expect(() => controller.updateCoordinates(eventId, body)).toThrow(
        'Longitude must be between -180 and 180',
      );
    });

    it('should accept valid edge case coordinates', async () => {
      const eventId = 'test-event-id';
      const body = { latitude: -90, longitude: -180 };
      const updatedEvent = { id: eventId, ...body };

      mockEventsService.updateCoordinates.mockResolvedValue(updatedEvent);

      const result = await controller.updateCoordinates(eventId, body);

      expect(service.updateCoordinates).toHaveBeenCalledWith(
        eventId,
        body.latitude,
        body.longitude,
      );
      expect(result).toEqual(updatedEvent);
    });

    it('should accept valid edge case coordinates (max values)', async () => {
      const eventId = 'test-event-id';
      const body = { latitude: 90, longitude: 180 };
      const updatedEvent = { id: eventId, ...body };

      mockEventsService.updateCoordinates.mockResolvedValue(updatedEvent);

      const result = await controller.updateCoordinates(eventId, body);

      expect(service.updateCoordinates).toHaveBeenCalledWith(
        eventId,
        body.latitude,
        body.longitude,
      );
      expect(result).toEqual(updatedEvent);
    });
  });
});
