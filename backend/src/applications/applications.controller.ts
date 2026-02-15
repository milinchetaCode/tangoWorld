import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':eventId')
  apply(@Param('eventId') eventId: string, @Request() req: any) {
    return this.applicationsService.apply(req.user.userId, eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId')
  getEventApplications(@Param('eventId') eventId: string) {
    return this.applicationsService.findAllForEvent(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserApplications(@Request() req: any) {
    return this.applicationsService.findUserApplications(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.applicationsService.updateStatus(id, status);
  }
}
