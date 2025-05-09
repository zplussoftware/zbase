import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import * as bcrypt from 'bcrypt';

async function verifyAdminCredentials() {
  console.log('Starting admin credentials verification...');
  const app = await NestFactory.create(AppModule);
  const userService = app.get(UserService);

  try {
    // Find the admin user
    console.log('Looking for admin user in database...');
    const adminUser = await userService.findByEmail('admin@example.com');
    
    if (!adminUser) {
      console.log('ERROR: Admin user not found in database!');
      return;
    }
    
    console.log('Found admin user with:');
    console.log('- ID:', adminUser.id);
    console.log('- Email:', adminUser.email);
    console.log('- Name:', adminUser.name);
    console.log('- Roles:', adminUser.roles);
    console.log('- Password Hash:', adminUser.password);
    
    // Test password
    const testPassword = 'admin123';
    console.log('\nTesting password match for:', testPassword);
    
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log('Password valid:', isPasswordValid ? 'YES ✅' : 'NO ❌');
    
    if (!isPasswordValid) {
      // Create a new hash and update
      console.log('\nPassword mismatch. Creating new hash and updating user...');
      const newHashedPassword = await bcrypt.hash(testPassword, 10);
      console.log('New hashed password:', newHashedPassword);
      
      await userService.update(adminUser.id, { password: newHashedPassword });
      console.log('Admin password updated successfully!');
      console.log('Please try logging in with: admin@example.com / admin123');
    }
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await app.close();
  }
}

verifyAdminCredentials();