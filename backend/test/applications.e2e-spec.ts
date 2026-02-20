import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Applications Endpoints (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let organizerToken: string;

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

  const mockUserId = 'user-app-e2e-123';
  const mockOrganizerId = 'organizer-app-e2e-456';
  const mockEventId = 'event-app-e2e-789';
  const mockApplicationId = 'application-e2e-111';

  const mockUser = {
    id: mockUserId,
    email: 'dancer@example.com',
    passwordHash: 'hashed',
    name: 'Maria',
    surname: 'Dancer',
    city: 'Buenos Aires',
    gender: 'female',
    dietaryNeeds: null,
    role: 'user',
    organizerStatus: 'none',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvent = {
    id: mockEventId,
    title: 'Tango Marathon E2E',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-03'),
    location: 'Buenos Aires',
    venue: 'Milonga Central',
    capacity: 100,
    maleCapacity: 50,
    femaleCapacity: 50,
    organizerId: mockOrganizerId,
    isPublished: true,
    status: 'published',
    applications: [],
  };

  const mockApplication = {
    id: mockApplicationId,
    userId: mockUserId,
    eventId: mockEventId,
    status: 'applied',
    paymentDone: false,
    pricingOption: null,
    numberOfDays: null,
    totalPrice: null,
    appliedAt: new Date(),
    updatedAt: new Date(),
    event: {
      ...mockEvent,
      applications: [],
    },
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
    userToken = jwtService.sign({
      sub: mockUserId,
      email: 'dancer@example.com',
      role: 'user',
      organizerStatus: 'none',
    });
    organizerToken = jwtService.sign({
      sub: mockOrganizerId,
      email: 'organizer@example.com',
      role: 'organizer',
      organizerStatus: 'approved',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /applications/:eventId', () => {
    it('should allow an authenticated user to apply to an event', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.application.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.application.create.mockResolvedValue(mockApplication);

      const response = await request(app.getHttpServer())
        .post(`/applications/${mockEventId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('applied');
      expect(mockPrismaService.application.create).toHaveBeenCalledTimes(1);
    });

    it('should return 409 when user has already applied to the event', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.application.findUnique.mockResolvedValue(mockApplication);

      await request(app.getHttpServer())
        .post(`/applications/${mockEventId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(409);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/applications/${mockEventId}`)
        .send({})
        .expect(401);
    });

    it('should return 404 when event does not exist', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/applications/nonexistent-event')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(404);
    });
  });

  describe('GET /applications/me', () => {
    it('should return the authenticated user applications', async () => {
      mockPrismaService.application.findMany.mockResolvedValue([mockApplication]);

      const response = await request(app.getHttpServer())
        .get('/applications/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(mockUserId);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/applications/me')
        .expect(401);
    });
  });

  describe('PATCH /applications/:id/status', () => {
    it('should allow the organizer to update application status', async () => {
      const updatedApplication = { ...mockApplication, status: 'accepted' };
      mockPrismaService.application.findUnique.mockResolvedValue({
        ...mockApplication,
        event: { organizerId: mockOrganizerId },
      });
      mockPrismaService.application.update.mockResolvedValue(updatedApplication);

      const response = await request(app.getHttpServer())
        .patch(`/applications/${mockApplicationId}/status`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ status: 'accepted' })
        .expect(200);

      expect(response.body.status).toBe('accepted');
    });

    it('should return 403 when a non-organizer tries to update status', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue({
        ...mockApplication,
        event: { organizerId: mockOrganizerId },
      });

      await request(app.getHttpServer())
        .patch(`/applications/${mockApplicationId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'accepted' })
        .expect(403);
    });

    it('should return 404 when application does not exist', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/applications/nonexistent-app/status')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ status: 'accepted' })
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/applications/${mockApplicationId}/status`)
        .send({ status: 'accepted' })
        .expect(401);
    });
  });

  describe('PATCH /applications/:id/payment', () => {
    it('should allow the organizer to update payment status', async () => {
      const updatedApplication = { ...mockApplication, paymentDone: true };
      mockPrismaService.application.findUnique.mockResolvedValue({
        ...mockApplication,
        event: { organizerId: mockOrganizerId },
      });
      mockPrismaService.application.update.mockResolvedValue(updatedApplication);

      const response = await request(app.getHttpServer())
        .patch(`/applications/${mockApplicationId}/payment`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ paymentDone: true })
        .expect(200);

      expect(response.body.paymentDone).toBe(true);
    });

    it('should return 403 when a non-organizer tries to update payment', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue({
        ...mockApplication,
        event: { organizerId: mockOrganizerId },
      });

      await request(app.getHttpServer())
        .patch(`/applications/${mockApplicationId}/payment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ paymentDone: true })
        .expect(403);
    });
  });
});
