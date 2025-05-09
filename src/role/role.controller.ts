import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpException, HttpStatus, Req } from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Controller('api/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly activityLogService: ActivityLogService
  ) {}

  @Get()
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Role> {
    try {
      return await this.roleService.findOne(+id);
    } catch (error) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto, @Req() req: any): Promise<Role> {
    try {
      const newRole = await this.roleService.create(createRoleDto);
      
      // Log role creation
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'ROLE_CREATE',
        module: 'role',
        description: `Created new role: ${newRole.name}`,
        details: {
          roleId: newRole.id,
          roleName: newRole.name,
          description: newRole.description
        }
      });
      
      return newRole;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating role',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any
  ): Promise<Role> {
    try {
      // Get original role for comparison
      const originalRole = await this.roleService.findOne(+id);
      const updatedRole = await this.roleService.update(+id, updateRoleDto);
      
      // Log role update
      const changes = {};
      if (updateRoleDto.name && updateRoleDto.name !== originalRole.name) {
        changes['name'] = { from: originalRole.name, to: updateRoleDto.name };
      }
      if (updateRoleDto.description && updateRoleDto.description !== originalRole.description) {
        changes['description'] = { from: originalRole.description, to: updateRoleDto.description };
      }
      
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'ROLE_UPDATE',
        module: 'role',
        description: `Updated role: ${originalRole.name} (ID: ${id})`,
        details: {
          roleId: +id,
          changes
        }
      });
      
      return updatedRole;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating role',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    try {
      // Get role data before removal
      const role = await this.roleService.findOne(+id);
      
      // Delete the role
      await this.roleService.remove(+id);
      
      // Log role deletion
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'ROLE_DELETE',
        module: 'role',
        description: `Deleted role: ${role.name} (ID: ${id})`,
        details: {
          roleId: +id,
          roleName: role.name
        }
      });
      
      return;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting role',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: any): Promise<void> {
    try {
      // Restore the soft-deleted role
      await this.roleService.restore(+id);
      
      // Log role restoration
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'ROLE_RESTORE',
        module: 'role',
        description: `Restored previously deleted role with ID: ${id}`,
        details: {
          restoredRoleId: +id
        }
      });
      
      return;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error restoring role',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id/permissions')
  async getPermissions(@Param('id') id: string): Promise<{ featurePermissions: string[], controllerPermissions: string[] }> {
    try {
      return await this.roleService.getPermissions(+id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting permissions',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id/permissions')
  async updatePermissions(
    @Param('id') id: string,
    @Body() updatePermissionsDto: UpdateRolePermissionsDto,
    @Req() req: any
  ): Promise<Role> {
    try {
      // Get original permissions
      const originalPermissions = await this.roleService.getPermissions(+id);
      const role = await this.roleService.findOne(+id);
      
      // Update permissions
      const updatedRole = await this.roleService.updatePermissions(+id, updatePermissionsDto);
      
      // Log permission changes
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'ROLE_PERMISSIONS_UPDATE',
        module: 'role',
        description: `Updated permissions for role: ${role.name} (ID: ${id})`,
        details: {
          roleId: +id,
          roleName: role.name,
          changes: {
            featurePermissions: {
              from: originalPermissions.featurePermissions,
              to: updatePermissionsDto.featurePermissions
            },
            controllerPermissions: {
              from: originalPermissions.controllerPermissions,
              to: updatePermissionsDto.controllerPermissions
            }
          }
        }
      });
      
      return updatedRole;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating permissions',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}