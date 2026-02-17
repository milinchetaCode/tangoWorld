import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventCostsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.EventCostCreateInput) {
    return this.prisma.eventCost.create({
      data,
    });
  }

  async findAllByEventId(eventId: string) {
    return this.prisma.eventCost.findMany({
      where: { eventId },
      orderBy: { date: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.eventCost.delete({
      where: { id },
    });
  }

  async getBusinessDashboardData(eventId: string) {
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
