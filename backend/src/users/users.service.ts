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
    // Set organizerStatus to 'pending' - requires manual admin approval.
    // Users can only request organizer status for themselves (verified in controller).
    // Admins can approve pending organizers using the approve-organizer.ts script:
    //   npx ts-node prisma/approve-organizer.ts user@example.com
    // After approval, users must log out and log back in to refresh their JWT token.
    return this.prisma.user.update({
      where: { id },
      data: { 
        role: 'organizer',
        organizerStatus: 'pending' 
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
