import { Module } from '@nestjs/common';
import { EventCostsController, BusinessDashboardController } from './event-costs.controller';
import { EventCostsService } from './event-costs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventCostsController, BusinessDashboardController],
  providers: [EventCostsService],
  exports: [EventCostsService],
})
export class EventCostsModule {}
