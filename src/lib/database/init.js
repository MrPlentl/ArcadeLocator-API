
// user: xlr8ruser
// pass: w4cE2e2PAWbpWeyqUDh4JdQkCuKq26a8

import pool from './postgres.js';

const fetchData = async () => {
  try {
    const result = await pool.query('SELECT * FROM venue ORDER BY id');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('Query error:', error);
  }
};

fetchData();
