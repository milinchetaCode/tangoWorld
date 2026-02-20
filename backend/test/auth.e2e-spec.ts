import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;

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

  let hashedPassword: string;

  const mockUser = {
    id: 'user-auth-123',
    email: 'auth@example.com',
    passwordHash: '',
    name: 'Test',
    surname: 'User',
    city: 'Buenos Aires',
    gender: 'male',
    dietaryNeeds: null,
    role: 'user',
    organizerStatus: 'none',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('password123', 10);
    mockUser.passwordHash = hashedPassword;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New',
        surname: 'User',
        city: 'Buenos Aires',
        gender: 'male',
      };

      const createdUser = {
        ...mockUser,
        id: 'new-user-id',
        email: registerDto.email,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.email).toBe(registerDto.email);
      expect(response.body.id).toBeDefined();
    });

    it('should return 409 when email is already registered', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'auth@example.com',
          password: 'password123',
          name: 'Test',
          surname: 'User',
          city: 'Buenos Aires',
          gender: 'male',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should return access token and user on valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'auth@example.com', password: 'password123' })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('auth@example.com');
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('should return 401 on wrong password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'auth@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 401 when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'notexist@example.com', password: 'password123' })
        .expect(401);
    });
  });
});
