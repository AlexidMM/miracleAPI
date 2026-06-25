import { Controller, Get, Param, Patch, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../auth/roles.guard';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('mine')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  findMine(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.findByUser(req.user.userId);
  }

  @Patch('read-all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['researcher'])
  markAsRead(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAsRead(+id, req.user.userId);
  }
}
