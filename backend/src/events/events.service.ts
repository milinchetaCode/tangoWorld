import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event, Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, organizerId?: string) {
    const whereConditions: Prisma.EventWhereInput = {
      // Always restrict the public listing to published events only
      isPublished: true,
    };

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

  async findMyEvents(userId: string) {
    // Returns ALL events (including unpublished) owned by the authenticated organizer
    return this.prisma.event.findMany({
      where: { organizerId: userId },
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
    const event = await this.prisma.event.findUnique({
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

    if (!event) return null;

    // Exclude contact – it is only returned via the protected /events/:id/contact endpoint
    const { contact: _contact, ...eventWithoutContact } = event;
    return eventWithoutContact;
  }

  async findOneContact(id: string, userId: string) {
    // Verify that the requesting user has an accepted application for this event
    const application = await this.prisma.application.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
      select: { status: true },
    });

    if (!application || application.status !== 'accepted') {
      throw new ForbiddenException(
        'Contact information is only available to accepted dancers',
      );
    }

    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { contact: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return { contact: event.contact };
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
        throw new BadRequestException('Only the event organizer can edit this event');
      }
    }

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can delete this event');
    }

    return this.prisma.event.delete({
      where: { id },
    });
  }

  async updateCoordinates(
    id: string,
    latitude: number,
    longitude: number,
    userId: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can update this event',
      );
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        latitude,
        longitude,
      },
    });
  }

  async updatePublicationStatus(
    id: string,
    isPublished: boolean,
    userId: string,
  ) {
    // Fetch event to verify ownership and get applications
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

    if (event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can update publication status',
      );
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
