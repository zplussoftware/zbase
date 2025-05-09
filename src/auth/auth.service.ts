import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private activityLogService: ActivityLogService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('AuthService.validateUser called with email:', email);
    const user = await this.userService.findByEmail(email);
    console.log('User found:', user ? JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      // Log part of the hashed password for debugging
      passwordHash: user.password.substring(0, 20) + '...',
    }) : 'No');
    
    if (!user) {
      console.log('User not found with email:', email);
      return null;
    }

    console.log('Comparing password with hash');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid ? 'Valid' : 'Invalid');
    
    if (!isPasswordValid) {
      console.log('Password invalid for user:', email);
      // Log failed login attempt
      try {
        await this.activityLogService.create({
          userId: user.id,
          userName: user.name,
          action: 'LOGIN_FAILED',
          module: 'auth',
          description: 'Failed login attempt with invalid password',
        });
      } catch (error) {
        console.error('Failed to log login failure:', error);
      }
      return null;
    }

    const { password: _, ...result } = user;
    console.log('Authentication successful, returning user data');
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    
    // Log successful login
    try {
      await this.activityLogService.create({
        userId: user.id,
        userName: user.name,
        action: 'LOGIN',
        module: 'auth',
        description: 'User logged in successfully',
      });
    } catch (error) {
      console.error('Failed to log login activity:', error);
    }
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  async register(userData: any) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create new user
    const newUser = await this.userService.create({
      ...userData,
      password: hashedPassword,
    });

    // Log registration
    try {
      await this.activityLogService.create({
        userId: newUser.id,
        userName: newUser.name,
        action: 'REGISTER',
        module: 'auth',
        description: 'User registered successfully',
      });
    } catch (error) {
      console.error('Failed to log registration activity:', error);
    }

    // Return JWT token
    const { password, ...result } = newUser;
    return this.login(result);
  }

  async logout(userId: number, userName: string) {
    // Log logout
    try {
      await this.activityLogService.create({
        userId,
        userName,
        action: 'LOGOUT',
        module: 'auth',
        description: 'User logged out',
      });
    } catch (error) {
      console.error('Failed to log logout activity:', error);
    }
    
    return { message: 'Logout successful' };
  }

  async updateProfile(userId: number, updateData: any) {
    try {
      // Get current user data for activity log
      const currentUser = await this.userService.findOne(userId);
      if (!currentUser) {
        throw new UnauthorizedException('User not found');
      }

      // Update user profile
      const updatedUser = await this.userService.update(userId, {
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone
      });

      // Log profile update activity
      await this.activityLogService.create({
        userId,
        userName: currentUser.name,
        action: 'PROFILE_UPDATE',
        module: 'auth',
        description: 'User updated their profile information',
        details: {
          oldData: {
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || null
          },
          newData: {
            name: updateData.name,
            email: updateData.email,
            phone: updateData.phone || null
          }
        }      });

      if (!updatedUser) {
        throw new Error('User not found or update failed');
      }
      
      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      // Get user data
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await this.userService.update(userId, { password: hashedPassword });

      // Log password change activity
      await this.activityLogService.create({
        userId,
        userName: user.name,
        action: 'PASSWORD_CHANGE',
        module: 'auth',
        description: 'User changed their password'
      });

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    try {
      // Get current user data for activity log
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Update user avatar
      const updatedUser = await this.userService.update(userId, { avatarUrl });

      // Log avatar update activity
      await this.activityLogService.create({
        userId,
        userName: user.name,
        action: 'AVATAR_UPDATE',
        module: 'auth',
        description: 'User updated their profile picture',
        details: {
          oldAvatar: user.avatarUrl || null,
          newAvatar: avatarUrl
        }      });

      if (!updatedUser) {
        throw new Error('User not found or update failed');
      }

      const { password, ...result } = updatedUser;
      return { 
        ...result,
        avatarUrl 
      };
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  }
}