import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private userService: UserService) {}

  getHello(): any {
    return {
      name: 'ZBase API',
      version: '1.0.0',
      description: 'RESTful API with authentication and authorization',
      endpoints: {
        auth: {
          login: '/api/auth/login',
          register: '/api/auth/register',
          profile: '/api/auth/profile',
        },
        users: {
          getAll: '/api/users',
          getOne: '/api/users/:id',
          create: '/api/users',
          update: '/api/users/:id',
          delete: '/api/users/:id',
        }
      }
    };
  }

  async onModuleInit() {
    await this.createSampleUsers();
  }

  private async createSampleUsers() {
    try {
      // Tạo tài khoản Super Admin
      const adminExists = await this.userService.findByEmail('admin@example.com');
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.userService.create({
          name: 'Super Admin',
          email: 'admin@example.com',
          password: hashedPassword,
          roles: ['admin', 'user'],
        });
        console.log('Super Admin account created');
      }

      // Tạo tài khoản Manager
      const managerExists = await this.userService.findByEmail('manager@example.com');
      if (!managerExists) {
        const hashedPassword = await bcrypt.hash('manager123', 10);
        await this.userService.create({
          name: 'Manager Admin',
          email: 'manager@example.com',
          password: hashedPassword,
          roles: ['admin', 'manager', 'user'],
        });
        console.log('Manager Admin account created');
      }

      // Tạo tài khoản User thường
      const userExists = await this.userService.findByEmail('user@example.com');
      if (!userExists) {
        const hashedPassword = await bcrypt.hash('user123', 10);
        await this.userService.create({
          name: 'Regular User',
          email: 'user@example.com',
          password: hashedPassword,
          roles: ['user'],
        });
        console.log('Regular User account created');
      }

      console.log('Sample users initialization completed');
    } catch (error) {
      console.error('Error creating sample users:', error);
    }
  }
}
