import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface ApplicationPricingData {
  pricingOption?: string;
  numberOfDays?: number;
  totalPrice?: number;
}

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: string, eventId: string, applicationData?: ApplicationPricingData) {
    // 1. Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        applications: {
          where: { status: 'accepted' },
          include: { user: { select: { gender: true } } },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    // 2. Check for duplicate application
    const existing = await this.prisma.application.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (existing) throw new ConflictException('Already applied');

    // 3. Simple capacity check for initial status
    // In MVP, we might just mark as 'applied' and let organizer decide
    // But per README, we can auto-waitlist if definitely full
    const acceptedMale = event.applications.filter(
      (a) => a.user.gender === 'male',
    ).length;
    const acceptedFemale = event.applications.filter(
      (a) => a.user.gender === 'female',
    ).length;

    // Get current user's gender
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let initialStatus = 'applied';
    if (user.gender === 'male' && acceptedMale >= event.maleCapacity) {
      initialStatus = 'waitlisted';
    } else if (
      user.gender === 'female' &&
      acceptedFemale >= event.femaleCapacity
    ) {
      initialStatus = 'waitlisted';
    } else if (acceptedMale + acceptedFemale >= event.capacity) {
      initialStatus = 'waitlisted';
    }

    // Prepare application data
    const data: Prisma.ApplicationCreateInput = {
      user: {
        connect: { id: userId },
      },
      event: {
        connect: { id: eventId },
      },
      status: initialStatus,
    };

    // Add pricing information if provided
    if (applicationData?.pricingOption) {
      data.pricingOption = applicationData.pricingOption;
    }
    if (applicationData?.numberOfDays) {
      data.numberOfDays = applicationData.numberOfDays;
    }
    if (applicationData?.totalPrice) {
      data.totalPrice = applicationData.totalPrice;
    }

    return this.prisma.application.create({
      data,
    });
  }

  async findAllForEvent(eventId: string) {
    // First, get the event to know the organizer
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const applications = await this.prisma.application.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            gender: true,
            dietaryNeeds: true,
          },
        },
      },
    });

    // Optimize: Fetch all past events for all users in a single query
    const userIds = applications.map((app) => app.userId);
    
    const allPastEvents = await this.prisma.application.findMany({
      where: {
        userId: { in: userIds },
        status: 'accepted',
        eventId: { not: eventId }, // Exclude current event
        event: {
          organizerId: event.organizerId, // Same organizer
          endDate: { lt: new Date() }, // Only truly past events
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        event: {
          startDate: 'desc',
        },
      },
    });

    // Group past events by userId
    const pastEventsByUser = allPastEvents.reduce((acc, pe) => {
      if (!acc[pe.userId]) {
        acc[pe.userId] = [];
      }
      acc[pe.userId].push({
        id: pe.event.id,
        title: pe.event.title,
        startDate: pe.event.startDate,
        endDate: pe.event.endDate,
      });
      return acc;
    }, {} as Record<string, Array<{ id: string; title: string; startDate: Date; endDate: Date }>>);

    // Enrich applications with past events data
    const applicationsWithHistory = applications.map((application) => ({
      ...application,
      user: {
        ...application.user,
        pastEventsWithOrganizer: pastEventsByUser[application.userId] || [],
      },
    }));

    return applicationsWithHistory;
  }

  async findUserApplications(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            applications: {
              where: { status: 'accepted' },
            },
          },
        },
      },
    });

    // Add acceptedCount to each event and remove applications array
    return applications.map((app) => {
      const { applications: eventApplications, ...eventData } = app.event;
      return {
        ...app,
        event: {
          ...eventData,
          acceptedCount: eventApplications.length,
        },
      };
    });
  }

  async updateStatus(id: string, status: string, userId: string) {
    // Get the application with event info to verify authorization
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify the user is the organizer of the event
    if (application.event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can update application status',
      );
    }

    return this.prisma.application.update({
      where: { id },
      data: { status },
    });
  }

  async updatePayment(id: string, paymentDone: boolean, userId: string) {
    // Get the application with event info to verify authorization
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify the user is the organizer of the event
    if (application.event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can update payment status',
      );
    }

    return this.prisma.application.update({
      where: { id },
      data: { paymentDone },
    });
  }
}
