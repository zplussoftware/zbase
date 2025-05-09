import { Controller, Get, Post, Body, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createActivityLogDto: CreateActivityLogDto, @Req() req: any) {
    try {
      // Optionally add IP and user agent from request
      if (req.ip) {
        createActivityLogDto.ipAddress = req.ip;
      }
      if (req.headers['user-agent']) {
        createActivityLogDto.userAgent = req.headers['user-agent'];
      }
      
      return await this.activityLogService.create(createActivityLogDto);
    } catch (error) {
      throw new HttpException('Failed to log activity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.activityLogService.findAll(page, limit);
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findRecent(@Query('limit') limit: number = 10) {
    return this.activityLogService.findRecent(limit);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async findByUserId(
    @Query('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req: any
  ) {
    // If not admin, users can only see their own activity logs
    if (!req.user.roles.includes('admin') && req.user.id !== userId) {
      throw new HttpException('Unauthorized access to user logs', HttpStatus.FORBIDDEN);
    }
    
    return this.activityLogService.findByUserId(userId, page, limit);
  }

  @Get('action')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findByAction(
    @Query('action') action: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.activityLogService.findByAction(action, page, limit);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async restore(@Query('id') id: number, @Req() req: any) {
    try {
      await this.activityLogService.restore(id);
      
      // Log the restoration activity
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'ACTIVITY_LOG_RESTORE',
        module: 'activity-log',
        description: `Restored activity log with ID: ${id}`,
        details: {
          restoredLogId: id
        }
      });
      
      return { success: true, message: 'Activity log restored successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error restoring activity log',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}