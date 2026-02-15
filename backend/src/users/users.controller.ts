import { Controller, Post, Param, UseGuards, Request, Put, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface UpdateProfileDto {
    city?: string;
    gender?: string;
    dietaryNeeds?: string;
}

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Post(':id/request-organizer')
    async requestOrganizer(@Param('id') id: string, @Request() req: any) {
        // Simple security check: Ensure user can only request for themselves
        if (req.user.userId !== id) {
            throw new Error('Unauthorized');
        }
        return this.usersService.requestOrganizer(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateProfile(
        @Param('id') id: string,
        @Request() req: any,
        @Body() updateData: UpdateProfileDto
    ) {
        // Security check: Ensure user can only update their own profile
        if (req.user.userId !== id) {
            throw new UnauthorizedException('You can only update your own profile');
        }

        // Validate that only allowed fields are being updated
        const allowedFields = ['city', 'gender', 'dietaryNeeds'];
        const updateKeys = Object.keys(updateData);
        const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
        
        if (invalidFields.length > 0) {
            throw new BadRequestException(`Cannot update fields: ${invalidFields.join(', ')}`);
        }

        return this.usersService.updateProfile(id, updateData);
    }
}
