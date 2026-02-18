import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    } else {
      // Only show published events for public listing
      whereConditions.isPublished = true;
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

  async update(id: string, data: Prisma.EventUpdateInput, userId?: string) {
    // If userId is provided, verify that the user is the organizer of this event
    if (userId) {
      const event = await this.prisma.event.findUnique({
        where: { id },
        select: { organizerId: true },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      if (event.organizerId !== userId) {
        throw new BadRequestException('You are not authorized to edit this event');
      }
    }

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

  async updatePublicationStatus(id: string, isPublished: boolean) {
    // Fetch event with applications to check registrations
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        applications: {
          where: {
            status: 'accepted',
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // If trying to unpublish (set to false) and event has accepted applications
    // We allow it but the frontend will handle disabling registration
    // The event will remain visible but with registration disabled
    
    return this.prisma.event.update({
      where: { id },
      data: {
        isPublished,
      },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
  }
}
