import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpException, HttpStatus, Req } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Controller('api/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly activityLogService: ActivityLogService
  ) {}

  @Get()
  async findAll(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Permission> {
    try {
      return await this.permissionService.findOne(+id);
    } catch (error) {
      throw new HttpException('Permission not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto, @Req() req: any): Promise<Permission> {
    try {
      const newPermission = await this.permissionService.create(createPermissionDto);
      
      // Log permission creation
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'PERMISSION_CREATE',
        module: 'permission',
        description: this.getPermissionDescription('created', newPermission),
        details: {
          permissionId: newPermission.id,
          permissionType: newPermission.type,
          permissionData: createPermissionDto
        }
      });
      
      return newPermission;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating permission',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Req() req: any
  ): Promise<Permission> {
    try {
      // Get original permission for comparison
      const originalPermission = await this.permissionService.findOne(+id);
      const updatedPermission = await this.permissionService.update(+id, updatePermissionDto);
      
      // Log permission update
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'PERMISSION_UPDATE',
        module: 'permission',
        description: this.getPermissionDescription('updated', originalPermission),
        details: {
          permissionId: +id,
          originalPermission,
          changes: updatePermissionDto
        }
      });
      
      return updatedPermission;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating permission',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    try {
      // Get permission before deletion for logging
      const permission = await this.permissionService.findOne(+id);
      
      // Delete the permission
      await this.permissionService.remove(+id);
      
      // Log permission deletion
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'PERMISSION_DELETE',
        module: 'permission',
        description: this.getPermissionDescription('deleted', permission),
        details: {
          permissionId: +id,
          deletedPermission: permission
        }
      });
      
      return;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting permission',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: any): Promise<void> {
    try {
      // Restore the soft-deleted permission
      await this.permissionService.restore(+id);
      
      // Log permission restoration
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'PERMISSION_RESTORE',
        module: 'permission',
        description: `Restored previously deleted permission with ID: ${id}`,
        details: {
          restoredPermissionId: +id
        }
      });
      
      return;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error restoring permission',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Helper method to generate meaningful description based on permission type
  private getPermissionDescription(action: string, permission: Permission): string {
    if (permission.type === 'feature') {
      return `${action} feature permission: ${permission.name} (${permission.category})`;
    } else if (permission.type === 'controller') {
      return `${action} controller permission: ${permission.controller}.${permission.action} (${permission.route})`;
    } else {
      return `${action} permission with ID: ${permission.id}`;
    }
  }
}