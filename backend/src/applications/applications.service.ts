import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: string, eventId: string) {
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

    return this.prisma.application.create({
      data: {
        userId,
        eventId,
        status: initialStatus,
      },
    });
  }

  async findAllForEvent(eventId: string) {
    return this.prisma.application.findMany({
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

  async updateStatus(id: string, status: string) {
    return this.prisma.application.update({
      where: { id },
      data: { status },
    });
  }

  async updatePayment(id: string, paymentDone: boolean) {
    return this.prisma.application.update({
      where: { id },
      data: { paymentDone },
    });
  }
}
