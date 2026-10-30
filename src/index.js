require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    console.error('Check your .env credentials and run: npm run db:init');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Inventory API listening on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
