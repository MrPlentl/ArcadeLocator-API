import env from "../utils/environment.js";

import pkg from 'pg';
const { Pool } = pkg;

// const pool = new Pool({
//   user: "your_user",
//   host: "your_host",
//   database: "your_database",
//   password: "your_password",
//   port: 5432, // Default PostgreSQL port
// });

const pool = new Pool({
    user: env.DB_USERNAME,
    host: env.DB_HOSTNAME,
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
  });

export default pool;