const { Pool } = require('pg');
require('dotenv').config();

// Support both connection string and individual environment variables
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string if provided (e.g., from Neon, Railway, Render, etc.)
  // Fix URL-encoded characters in database name (e.g., %3B should be removed or decoded)
  let connectionString = process.env.DATABASE_URL;
  
  // Remove URL-encoded semicolon from database name if present
  // Some providers include %3B (encoded semicolon) which causes issues
  connectionString = connectionString.replace(/\/restaurant_search%3B/, '/restaurant_search');
  
  poolConfig = {
    connectionString: connectionString,
    ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Use individual environment variables
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_search',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

module.exports = pool;

