/**
 * Helper script to generate hashed passwords for system users
 * Run with: node scripts/hashPassword.js <password>
 */

const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('\n========================================');
  console.log('Password:', password);
  console.log('Hashed:', hashedPassword);
  console.log('========================================\n');
  console.log('Use this hashed password in your database for the passwordHash field');
}

const password = process.argv[2] || 'Admin@123';
hashPassword(password);
