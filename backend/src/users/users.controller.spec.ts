import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    updateProfile: jest.fn(),
    requestOrganizer: jest.fn(),
  };

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    const userId = 'test-user-id';
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      name: 'John',
      surname: 'Doe',
      city: 'New York',
      gender: 'male',
      dietaryNeeds: 'none',
      role: 'user',
      organizerStatus: 'none',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update profile with valid data', async () => {
      const updateData = {
        city: 'Paris',
        gender: 'male',
        dietaryNeeds: 'vegetarian',
      };
      const req = { user: { userId } };

      mockUsersService.updateProfile.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await controller.updateProfile(userId, req, updateData);

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(userId, updateData);
      expect(result.city).toBe('Paris');
      expect(result.dietaryNeeds).toBe('vegetarian');
    });

    it('should throw UnauthorizedException if user tries to update another user', async () => {
      const updateData = { city: 'Paris' };
      const req = { user: { userId: 'different-user-id' } };

      await expect(
        controller.updateProfile(userId, req, updateData),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUsersService.updateProfile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if trying to update disallowed fields', async () => {
      const updateData = { city: 'Paris', name: 'Jane' } as any;
      const req = { user: { userId } };

      await expect(
        controller.updateProfile(userId, req, updateData),
      ).rejects.toThrow(BadRequestException);

      expect(mockUsersService.updateProfile).not.toHaveBeenCalled();
    });

    it('should allow updating only city', async () => {
      const updateData = { city: 'London' };
      const req = { user: { userId } };

      mockUsersService.updateProfile.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await controller.updateProfile(userId, req, updateData);

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(userId, updateData);
      expect(result.city).toBe('London');
    });

    it('should allow updating only gender', async () => {
      const updateData = { gender: 'female' };
      const req = { user: { userId } };

      mockUsersService.updateProfile.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await controller.updateProfile(userId, req, updateData);

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(userId, updateData);
      expect(result.gender).toBe('female');
    });

    it('should allow updating only dietaryNeeds', async () => {
      const updateData = { dietaryNeeds: 'vegan' };
      const req = { user: { userId } };

      mockUsersService.updateProfile.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await controller.updateProfile(userId, req, updateData);

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(userId, updateData);
      expect(result.dietaryNeeds).toBe('vegan');
    });
  });

  describe('requestOrganizer', () => {
    const userId = 'test-user-id';
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      name: 'John',
      surname: 'Doe',
      city: 'New York',
      gender: 'male',
      dietaryNeeds: 'none',
      role: 'organizer',
      organizerStatus: 'pending',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should request organizer status and return new token', async () => {
      const req = { user: { userId } };
      const mockToken = 'new-jwt-token';

      mockUsersService.requestOrganizer.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue({
        access_token: mockToken,
        user: mockUser,
      });

      const result = await controller.requestOrganizer(userId, req);

      expect(mockUsersService.requestOrganizer).toHaveBeenCalledWith(userId);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        user: mockUser,
        access_token: mockToken,
      });
      expect(result.user.organizerStatus).toBe('pending');
    });

    it('should throw UnauthorizedException if user tries to request for another user', async () => {
      const req = { user: { userId: 'different-user-id' } };

      await expect(
        controller.requestOrganizer(userId, req),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUsersService.requestOrganizer).not.toHaveBeenCalled();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
});
