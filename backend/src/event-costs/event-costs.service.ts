import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface EventCostData {
  category: string;
  description: string;
  amount: number;
  date: Date;
}

@Injectable()
export class EventCostsService {
  constructor(private prisma: PrismaService) {}

  private async verifyEventOwnership(
    eventId: string,
    userId: string,
  ): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can access this resource',
      );
    }
  }

  async create(eventId: string, data: EventCostData, userId: string) {
    await this.verifyEventOwnership(eventId, userId);

    return this.prisma.eventCost.create({
      data: {
        ...data,
        event: { connect: { id: eventId } },
      },
    });
  }

  async findAllByEventId(eventId: string, userId: string) {
    await this.verifyEventOwnership(eventId, userId);

    return this.prisma.eventCost.findMany({
      where: { eventId },
      orderBy: { date: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const cost = await this.prisma.eventCost.findUnique({
      where: { id },
      select: { eventId: true },
    });

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    await this.verifyEventOwnership(cost.eventId, userId);

    return this.prisma.eventCost.delete({
      where: { id },
    });
  }

  async getBusinessDashboardData(eventId: string, userId: string) {
    await this.verifyEventOwnership(eventId, userId);

    // Get all costs for the event
    const costs = await this.prisma.eventCost.findMany({
      where: { eventId },
    });

    // Get all applications for the event
    const applications = await this.prisma.application.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            name: true,
            surname: true,
            email: true,
          },
        },
      },
    });

    // Calculate financial metrics
    const totalCosts = costs.reduce(
      (sum, cost) => sum + Number(cost.amount),
      0,
    );

    // Accepted applications with confirmed payment
    const paidApplications = applications.filter(
      (app) => app.status === 'accepted' && app.paymentDone,
    );
    const confirmedRevenue = paidApplications.reduce(
      (sum, app) => sum + (Number(app.totalPrice) || 0),
      0,
    );

    // All accepted applications (theoretical revenue)
    const acceptedApplications = applications.filter(
      (app) => app.status === 'accepted',
    );
    const theoreticalRevenue = acceptedApplications.reduce(
      (sum, app) => sum + (Number(app.totalPrice) || 0),
      0,
    );

    // Calculate costs by category
    const costsByCategory = costs.reduce(
      (acc, cost) => {
        const category = cost.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += Number(cost.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      costs,
      costsByCategory,
      totalCosts,
      confirmedRevenue,
      theoreticalRevenue,
      pendingRevenue: theoreticalRevenue - confirmedRevenue,
      netProfitConfirmed: confirmedRevenue - totalCosts,
      netProfitTheoretical: theoreticalRevenue - totalCosts,
      paymentCompletionRate:
        acceptedApplications.length > 0
          ? (paidApplications.length / acceptedApplications.length) * 100
          : 0,
      totalAcceptedApplications: acceptedApplications.length,
      paidApplications: paidApplications.length,
    };
  }
}
