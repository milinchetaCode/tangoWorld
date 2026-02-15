import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.eventsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('status', ['approved'])
  @Post()
  create(@Body() body: any, @Request() req: any) {
    // Inject current user as organizer
    return this.eventsService.create({
      ...body,
      organizer: {
        connect: { id: req.user.userId },
      },
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('status', ['approved'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.eventsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('status', ['approved'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
