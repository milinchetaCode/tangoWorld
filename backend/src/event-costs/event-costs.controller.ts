import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
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
    @Request() req: any,
  ) {
    return this.eventCostsService.create(
      eventId,
      {
        category: body.category,
        description: body.description,
        amount: body.amount,
        date: body.date ? new Date(body.date) : new Date(),
      },
      req.user.userId,
    );
  }

  @Get()
  findAll(@Param('eventId') eventId: string, @Request() req: any) {
    return this.eventCostsService.findAllByEventId(eventId, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.eventCostsService.remove(id, req.user.userId);
  }
}

@Controller('events/:eventId/business-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetMetadata('status', ['approved'])
export class BusinessDashboardController {
  constructor(private readonly eventCostsService: EventCostsService) {}

  @Get()
  getBusinessDashboard(
    @Param('eventId') eventId: string,
    @Request() req: any,
  ) {
    return this.eventCostsService.getBusinessDashboardData(
      eventId,
      req.user.userId,
    );
  }
}
