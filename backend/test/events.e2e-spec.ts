import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Events Endpoints (e2e)', () => {
  let app: INestApplication;
  let approvedOrganizerToken: string;
  let regularUserToken: string;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    eventCost: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const mockOrganizerId = 'organizer-e2e-123';
  const mockUserId = 'user-e2e-456';

  const mockEvent = {
    id: 'event-e2e-123',
    title: 'Buenos Aires Tango Festival',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-03-03'),
    location: 'Buenos Aires, Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    venue: 'Teatro Colón',
    imageUrl: null,
    guests: null,
    djs: null,
    schedule: null,
    capacity: 100,
    maleCapacity: 50,
    femaleCapacity: 50,
    organizerId: mockOrganizerId,
    status: 'published',
    isPublished: true,
    priceFullEventNoFoodNoAccommodation: null,
    priceFullEventFood: null,
    priceFullEventAccommodation: null,
    priceFullEventBoth: null,
    priceDailyFood: null,
    priceDailyNoFood: null,
    faq: null,
    contact: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizer: { name: 'Carlos', surname: 'Organizer' },
    applications: [],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const jwtService = app.get(JwtService);
    approvedOrganizerToken = jwtService.sign({
      sub: mockOrganizerId,
      email: 'organizer@example.com',
      role: 'organizer',
      organizerStatus: 'approved',
    });
    regularUserToken = jwtService.sign({
      sub: mockUserId,
      email: 'user@example.com',
      role: 'user',
      organizerStatus: 'none',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /events', () => {
    it('should return a list of published events without authentication', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([mockEvent]);

      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Buenos Aires Tango Festival');
    });

    it('should accept a search query parameter', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([mockEvent]);

      await request(app.getHttpServer())
        .get('/events?search=tango')
        .expect(200);

      expect(mockPrismaService.event.findMany).toHaveBeenCalledTimes(1);
    });

    it('should accept an organizerId query parameter', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([mockEvent]);

      await request(app.getHttpServer())
        .get(`/events?organizerId=${mockOrganizerId}`)
        .expect(200);

      expect(mockPrismaService.event.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /events/:id', () => {
    it('should return a single event by id', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);

      const response = await request(app.getHttpServer())
        .get(`/events/${mockEvent.id}`)
        .expect(200);

      expect(response.body.id).toBe(mockEvent.id);
      expect(response.body.title).toBe(mockEvent.title);
    });
  });

  describe('POST /events', () => {
    it('should create an event when authenticated as approved organizer', async () => {
      const createEventDto = {
        title: 'New Tango Event',
        startDate: '2025-04-01T10:00:00.000Z',
        endDate: '2025-04-03T22:00:00.000Z',
        location: 'Montevideo, Uruguay',
        venue: 'Teatro Solís',
        capacity: 60,
        maleCapacity: 30,
        femaleCapacity: 30,
      };

      const createdEvent = { ...mockEvent, ...createEventDto, id: 'new-event-id' };
      mockPrismaService.event.create.mockResolvedValue(createdEvent);

      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${approvedOrganizerToken}`)
        .send(createEventDto)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(mockPrismaService.event.create).toHaveBeenCalledTimes(1);
    });

    it('should return 403 when authenticated as regular user (not approved organizer)', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ title: 'Unauthorized Event' })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .send({ title: 'Unauthenticated Event' })
        .expect(401);
    });
  });

  describe('PATCH /events/:id/coordinates', () => {
    it('should update coordinates when authenticated', async () => {
      const updatedEvent = { ...mockEvent, latitude: 48.8566, longitude: 2.3522 };
      mockPrismaService.event.update.mockResolvedValue(updatedEvent);

      const response = await request(app.getHttpServer())
        .patch(`/events/${mockEvent.id}/coordinates`)
        .set('Authorization', `Bearer ${approvedOrganizerToken}`)
        .send({ latitude: 48.8566, longitude: 2.3522 })
        .expect(200);

      expect(response.body.latitude).toBe(48.8566);
      expect(response.body.longitude).toBe(2.3522);
    });

    it('should return 400 for invalid latitude out of range', async () => {
      await request(app.getHttpServer())
        .patch(`/events/${mockEvent.id}/coordinates`)
        .set('Authorization', `Bearer ${approvedOrganizerToken}`)
        .send({ latitude: 95, longitude: 2.3522 })
        .expect(400);
    });

    it('should return 400 for invalid longitude out of range', async () => {
      await request(app.getHttpServer())
        .patch(`/events/${mockEvent.id}/coordinates`)
        .set('Authorization', `Bearer ${approvedOrganizerToken}`)
        .send({ latitude: 48.8566, longitude: 200 })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/events/${mockEvent.id}/coordinates`)
        .send({ latitude: 48.8566, longitude: 2.3522 })
        .expect(401);
    });
  });

  describe('PATCH /events/:id/publication', () => {
    it('should update publication status when authenticated as approved organizer', async () => {
      const updatedEvent = { ...mockEvent, isPublished: false, applications: [] };
      mockPrismaService.event.findUnique.mockResolvedValue({ ...mockEvent, applications: [] });
      mockPrismaService.event.update.mockResolvedValue(updatedEvent);

      const response = await request(app.getHttpServer())
        .patch(`/events/${mockEvent.id}/publication`)
        .set('Authorization', `Bearer ${approvedOrganizerToken}`)
        .send({ isPublished: false })
        .expect(200);

      expect(response.body.isPublished).toBe(false);
    });

    it('should return 400 when isPublished is missing', async () => {
      await request(app.getHttpServer())
        .patch(`/events/${mockEvent.id}/publication`)
        .set('Authorization', `Bearer ${approvedOrganizerToken}`)
        .send({})
        .expect(400);
    });

    it('should return 403 when authenticated as regular user', async () => {
      await request(app.getHttpServer())
        .patch(`/events/${mockEvent.id}/publication`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ isPublished: true })
        .expect(403);
    });
  });
});
