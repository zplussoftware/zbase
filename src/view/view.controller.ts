import { Controller, Get, Render, Request, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class ViewController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private getUserFromRequest(request: any) {
    try {
      const token = request?.cookies?.jwt;
      if (!token) {
        return null;
      }
      const secret = this.configService.get<string>('JWT_SECRET') || 'fallback_secret';
      const payload = this.jwtService.verify(token, { secret });
      return { 
        userId: payload.sub, 
        email: payload.email,
        roles: payload.roles,
        isAuthenticated: true,
        isAdmin: payload.roles.includes('admin')
      };
    } catch (e) {
      // Token is invalid or expired
      return null;
    }
  }

  @Get()
  @Render('pages/index')
  index(@Request() req) {
    const user = this.getUserFromRequest(req);
    return {
      title: 'ZBase - Authentication & Authorization System',
      user
    };
  }

  @Get('login')
  @Render('pages/login')
  login(@Request() req) {
    const user = this.getUserFromRequest(req);
    
    // Redirect if already logged in
    if (user) {
      return { redirect: user.isAdmin ? '/admin' : '/' };
    }
    
    return {
      title: 'Login - ZBase',
      user
    };
  }

  @Get('register')
  @Render('pages/register')
  register(@Request() req) {
    const user = this.getUserFromRequest(req);
    
    // Redirect if already logged in
    if (user) {
      return { redirect: user.isAdmin ? '/admin' : '/' };
    }
    
    return {
      title: 'Register - ZBase',
      user
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Render('pages/admin')
  adminDashboard(@Request() req) {
    const user = this.getUserFromRequest(req);
    return {
      title: 'Admin Dashboard - ZBase',
      user
    };
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Render('pages/admin-users')
  adminUsers(@Request() req) {
    const user = this.getUserFromRequest(req);
    return {
      title: 'User Management - ZBase',
      user
    };
  }

  @Get('admin/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Render('pages/admin-roles')
  adminRoles(@Request() req) {
    const user = this.getUserFromRequest(req);
    return {
      title: 'Role Management - ZBase',
      user
    };
  }

  @Get('admin/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Render('pages/admin-permissions')
  adminPermissions(@Request() req) {
    const user = this.getUserFromRequest(req);
    return {
      title: 'Permission Management - ZBase',
      user
    };
  }

  @Get('admin/users/edit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Render('pages/admin-users-edit')
  async adminUsersEdit(@Request() req, @Param('id') id: string) {
    const userData = await this.userService.findOne(+id);
    const user = this.getUserFromRequest(req);
    return {
      title: 'Edit User - ZBase',
      user,
      userData
    };
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Render('pages/admin-settings')
  adminSettings(@Request() req) {
    const user = this.getUserFromRequest(req);
    return {
      title: 'System Settings - ZBase',
      user
    };
  }

  @Get('admin/activity-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Render('pages/admin-activity-logs')
  adminActivityLogs(@Request() req) {
    const user = this.getUserFromRequest(req);
    return {
      title: 'Activity Logs - ZBase',
      user
    };
  }
}