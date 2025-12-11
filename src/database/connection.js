const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Fix URL-encoded characters in connection string if using DATABASE_URL
if (process.env.DATABASE_URL) {
  // Remove URL-encoded semicolon from database name if present
  // Some providers include %3B (encoded semicolon) which causes issues
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/\/restaurant_search%3B/, '/restaurant_search');
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
