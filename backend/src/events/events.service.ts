import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event, Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async findAll(search?: string) {
        return this.prisma.event.findMany({
            where: search ? {
                OR: [
                    { title: { contains: search } },
                    { location: { contains: search } },
                    { venue: { contains: search } },
                ],
            } : {},
            include: {
                organizer: {
                    select: {
                        name: true,
                        surname: true,
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
}
