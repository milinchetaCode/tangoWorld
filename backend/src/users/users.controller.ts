import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/request-organizer')
  async requestOrganizer(@Param('id') id: string, @Request() req: any) {
    // Simple security check: Ensure user can only request for themselves
    if (req.user.userId !== id) {
      throw new Error('Unauthorized');
    }
    return this.usersService.requestOrganizer(id);
  }
}
