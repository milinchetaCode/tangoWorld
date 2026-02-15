import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event, Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, organizerId?: string) {
    const whereConditions: Prisma.EventWhereInput = {};

    // Filter by organizerId if provided
    if (organizerId) {
      whereConditions.organizerId = organizerId;
    }

    // Add search conditions
    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.event.findMany({
      where: whereConditions,
      include: {
        organizer: {
          select: {
            name: true,
            surname: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            name: true,
            surname: true,
            email: true,
          },
        },
        applications: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                gender: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: Prisma.EventCreateInput) {
    return this.prisma.event.create({
      data,
    });
  }

  async update(id: string, data: Prisma.EventUpdateInput) {
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async updateCoordinates(id: string, latitude: number, longitude: number) {
    try {
      return await this.prisma.event.update({
        where: { id },
        data: {
          latitude,
          longitude,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      throw error;
    }
  }
}
