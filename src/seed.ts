import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const userService = app.get(UserService);

  try {
    // Tạo tài khoản Super Admin
    const adminExists = await userService.findByEmail('admin@example.com');
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await userService.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        roles: ['admin', 'user'],
      });
      console.log('Super Admin account created');
    } else {
      console.log('Super Admin already exists');
    }

    // Tạo tài khoản Manager
    const managerExists = await userService.findByEmail('manager@example.com');
    if (!managerExists) {
      const hashedPassword = await bcrypt.hash('manager123', 10);
      await userService.create({
        name: 'Manager Admin',
        email: 'manager@example.com',
        password: hashedPassword,
        roles: ['admin', 'manager', 'user'],
      });
      console.log('Manager Admin account created');
    } else {
      console.log('Manager Admin already exists');
    }

    // Tạo tài khoản User thường
    const userExists = await userService.findByEmail('user@example.com');
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      await userService.create({
        name: 'Regular User',
        email: 'user@example.com',
        password: hashedPassword,
        roles: ['user'],
      });
      console.log('Regular User account created');
    } else {
      console.log('Regular User already exists');
    }

    console.log('Sample users initialization completed');
  } catch (error) {
    console.error('Error creating sample users:', error);
  } finally {
    await app.close();
  }
}

bootstrap();