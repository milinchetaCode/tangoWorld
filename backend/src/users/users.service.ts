import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

interface UpdateProfileData {
  city?: string;
  gender?: string;
  dietaryNeeds?: string;
}
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async requestOrganizer(id: string): Promise<User> {
    // Auto-approve organizers since there's no admin approval workflow in place.
    // Users can only request organizer status for themselves (verified in controller).
    // This enables immediate event creation without manual admin intervention.
    // Future enhancement: Add admin approval workflow if needed.
    return this.prisma.user.update({
      where: { id },
      data: { 
        role: 'organizer',
        organizerStatus: 'approved' 
      },
    });
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
