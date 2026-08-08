import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export async function connectWithRetry(initDbCallback, maxRetries = 10, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Connecting to MySQL database (attempt ${i + 1}/${maxRetries})...`);
      
      const config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      };
      
      pool = mysql.createPool(config);
      
      // Test the pool connection
      const connection = await pool.getConnection();
      console.log('Connected to MySQL successfully!');
      connection.release();
      
      if (initDbCallback) {
        await initDbCallback();
      }
      return pool;
    } catch (err) {
      console.error(`Database connection failed: ${err.message}`);
      if (i === maxRetries - 1) {
        console.error('Max retries reached. Exiting backend server.');
        process.exit(1);
      }
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export { pool };
