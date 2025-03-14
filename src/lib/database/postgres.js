import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'xlr8ruser',
  host: 'localhost',
  database: 'xlr8r_v1',
  password: 'w4cE2e2PAWbpWeyqUDh4JdQkCuKq26a8',
  port: 5432, // Default PostgreSQL port
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully!');
    client.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

testConnection();

export default pool;