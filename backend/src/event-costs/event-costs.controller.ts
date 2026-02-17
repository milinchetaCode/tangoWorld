import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { EventCostsService } from './event-costs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('events/:eventId/costs')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetMetadata('status', ['approved'])
export class EventCostsController {
  constructor(private readonly eventCostsService: EventCostsService) {}

  @Post()
  create(
    @Param('eventId') eventId: string,
    @Body()
    body: {
      category: string;
      description: string;
      amount: number;
      date?: string;
    },
  ) {
    return this.eventCostsService.create({
      event: { connect: { id: eventId } },
      category: body.category,
      description: body.description,
      amount: body.amount,
      date: body.date ? new Date(body.date) : new Date(),
    });
  }

  @Get()
  findAll(@Param('eventId') eventId: string) {
    return this.eventCostsService.findAllByEventId(eventId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventCostsService.remove(id);
  }
}

@Controller('events/:eventId/business-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetMetadata('status', ['approved'])
export class BusinessDashboardController {
  constructor(private readonly eventCostsService: EventCostsService) {}

  @Get()
  getBusinessDashboard(@Param('eventId') eventId: string) {
    return this.eventCostsService.getBusinessDashboardData(eventId);
  }
}
