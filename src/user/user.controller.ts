import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, HttpException, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActivityLogService } from '../activity-log/activity-log.service';
import * as bcrypt from 'bcrypt';

@Controller('api/users')
export class UserController {
  constructor(
    private userService: UserService,
    private activityLogService: ActivityLogService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any): Promise<User> {
    try {
      const newUser = await this.userService.create(createUserDto);
      
      // Log user creation activity
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'USER_CREATE',
        module: 'user',
        description: `Created new user: ${newUser.name} (${newUser.email})`,
        details: {
          createdUserId: newUser.id,
          userEmail: newUser.email,
          roles: newUser.roles
        }
      });
      
      return newUser;
    } catch (error) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any
  ): Promise<User> {
    // Get original user data for comparison
    const originalUser = await this.userService.findOne(+id);
    if (!originalUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Create a copy of the update DTO to modify
    const updatedUserData = { ...updateUserDto };    // If password is included, hash it before update
    if (updatedUserData.password) {
      try {
        console.log('Hashing password for user update:', +id);
        const salt = await bcrypt.genSalt(10);
        updatedUserData.password = await bcrypt.hash(updatedUserData.password, salt);
        console.log('Password successfully hashed');
      } catch (error) {
        console.error('Error hashing password:', error);
        throw new HttpException('Failed to process password update', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
    const updatedUser = await this.userService.update(+id, updatedUserData);
    if (!updatedUser) {
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // Log user update activity
    const changes = {};
    if (updateUserDto.name && updateUserDto.name !== originalUser.name) {
      changes['name'] = { from: originalUser.name, to: updateUserDto.name };
    }
    if (updateUserDto.email && updateUserDto.email !== originalUser.email) {
      changes['email'] = { from: originalUser.email, to: updateUserDto.email };
    }
    if (updateUserDto.roles && JSON.stringify(updateUserDto.roles) !== JSON.stringify(originalUser.roles)) {
      changes['roles'] = { from: originalUser.roles, to: updateUserDto.roles };
    }
    if (updateUserDto.password) {
      changes['password'] = { changed: true };
    }
    
    await this.activityLogService.create({
      userId: req.user.userId || req.user.sub,
      userName: req.user.name || req.user.email,
      action: 'USER_UPDATE',
      module: 'user',
      description: `Updated user: ${originalUser.name} (ID: ${id})`,
      details: {
        targetUserId: +id,
        changes
      }
    });
    
    return updatedUser;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    // Get user data before deletion for logging
    const user = await this.userService.findOne(+id);
    if (user) {
      // Log user deletion activity
      await this.activityLogService.create({
        userId: req.user.userId || req.user.sub,
        userName: req.user.name || req.user.email,
        action: 'USER_DELETE',
        module: 'user',
        description: `Deleted user: ${user.name} (${user.email})`,
        details: {
          deletedUserId: +id,
          userEmail: user.email,
          userName: user.name,
          roles: user.roles
        }
      });
    }
    
    return this.userService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: any): Promise<void> {
    // Restore the soft-deleted user
    await this.userService.restore(+id);
    
    // Log user restoration activity
    await this.activityLogService.create({
      userId: req.user.userId || req.user.sub,
      userName: req.user.name || req.user.email,
      action: 'USER_RESTORE',
      module: 'user',
      description: `Restored previously deleted user with ID: ${id}`,
      details: {
        restoredUserId: +id
      }
    });
  }
}