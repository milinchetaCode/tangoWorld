import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { ApplicationsModule } from './applications/applications.module';
import { EventCostsModule } from './event-costs/event-costs.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    EventsModule,
    ApplicationsModule,
    EventCostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
