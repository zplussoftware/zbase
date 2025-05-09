// Password hashing fix patch for user service

import * as bcrypt from 'bcrypt';

// This is a patch function to add password hashing in UserService.update
export async function hashPasswordIfNeeded(password: string): Promise<string> {
  if (!password) return password;
  
  // Check if the password is already hashed (bcrypt hashes start with $2b$ or $2a$)
  if (password.startsWith('$2b$') || password.startsWith('$2a$')) {
    return password;
  }
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
