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
  apply(@Param('eventId') eventId: string, @Body() body: any, @Request() req: any) {
    const applicationData = {
      pricingOption: body.pricingOption,
      numberOfDays: body.numberOfDays,
      totalPrice: body.totalPrice,
    };
    return this.applicationsService.apply(req.user.userId, eventId, applicationData);
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
