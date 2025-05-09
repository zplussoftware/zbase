/**
 * Test script to verify password update functionality
 * Run with: node test-password-update.js
 */
const bcrypt = require('bcrypt');

async function testPasswordUpdate() {
  try {
    console.log('=== Password Update Test ===');
    
    // Simulate original password
    const originalPassword = 'original123';
    console.log(`Original password: ${originalPassword}`);
    
    // Hash original password (simulate stored password)
    const originalHash = await bcrypt.hash(originalPassword, 10);
    console.log(`Original hash: ${originalHash}`);
    
    // Verify original password works with original hash
    const originalVerify = await bcrypt.compare(originalPassword, originalHash);
    console.log(`Can verify original password: ${originalVerify}`);
    
    // Simulate new password
    const newPassword = 'newpass456';
    console.log(`\nNew password: ${newPassword}`);
    
    // Hash new password (simulate password update)
    const newHash = await bcrypt.hash(newPassword, 10);
    console.log(`New hash: ${newHash}`);
    
    // Verify new password works with new hash
    const newVerify = await bcrypt.compare(newPassword, newHash);
    console.log(`Can verify new password: ${newVerify}`);
    
    // This check ensures that the old password doesn't work with the new hash
    const oldWithNewHash = await bcrypt.compare(originalPassword, newHash);
    console.log(`\nOld password with new hash (should be false): ${oldWithNewHash}`);
    
    // This check ensures that the new password doesn't work with the old hash
    const newWithOldHash = await bcrypt.compare(newPassword, originalHash);
    console.log(`New password with old hash (should be false): ${newWithOldHash}`);
    
    // Demonstrate the problem of double-hashing
    console.log('\n=== Problem Scenario: Double Hashing ===');
    const doubleHashed = await bcrypt.hash(newHash, 10);
    console.log(`Double hashed password: ${doubleHashed}`);
    
    // Trying to verify with the double-hashed password (this would fail)
    const verifyDoubleHashed = await bcrypt.compare(newPassword, doubleHashed);
    console.log(`Can verify with double-hashed password: ${verifyDoubleHashed}`);
    
    console.log('\n=== Solution ===');
    console.log('Ensure password is only hashed once by removing duplicate hashing in UserService.update()');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPasswordUpdate();
