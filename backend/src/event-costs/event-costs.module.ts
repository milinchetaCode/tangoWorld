import { Module } from '@nestjs/common';
import { EventCostsController } from './event-costs.controller';
import { EventCostsService } from './event-costs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventCostsController],
  providers: [EventCostsService],
  exports: [EventCostsService],
})
export class EventCostsModule {}
