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
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':eventId')
  apply(
    @Param('eventId') eventId: string,
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req: any,
  ) {
    return this.applicationsService.apply(req.user.userId, eventId, createApplicationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId')
  getEventApplications(@Param('eventId') eventId: string, @Request() req: any) {
    return this.applicationsService.findAllForEvent(eventId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserApplications(@Request() req: any) {
    return this.applicationsService.findUserApplications(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.applicationsService.updateStatus(id, status, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/payment')
  async updatePayment(
    @Param('id') id: string,
    @Body('paymentDone') paymentDone: boolean,
    @Request() req: any,
  ) {
    return this.applicationsService.updatePayment(
      id,
      paymentDone,
      req.user.userId,
    );
  }
}
