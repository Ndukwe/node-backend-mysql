const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  const dbName = process.env.DB_NAME || 'inventory_db';

  if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
    throw new Error('DB_NAME must contain only letters, numbers, and underscores');
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs
      .readFileSync(schemaPath, 'utf8')
      .replace(/inventory_db/g, dbName);

    await connection.query(schema);
    console.log(`Database schema created successfully (${dbName}).`);
  } finally {
    await connection.end();
  }
}

init().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
