import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import * as bcrypt from 'bcrypt';

async function resetPassword() {
  const app = await NestFactory.create(AppModule);
  const userService = app.get(UserService);

  try {
    // Find the admin user
    console.log('Finding admin user...');
    const adminUser = await userService.findByEmail('admin@example.com');
    
    if (!adminUser) {
      console.log('Admin user not found!');
      return;
    }
    
    console.log('Admin user found with ID:', adminUser.id);
    
    // Generate a new hash for 'admin123'
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('New hashed password generated:', hashedPassword);
    
    // Update the admin user with the new password
    await userService.update(adminUser.id, { password: hashedPassword });
    console.log('Admin password updated successfully');
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await app.close();
  }
}

resetPassword();