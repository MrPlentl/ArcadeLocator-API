import env from "../../utils/environment.js";

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
	user: env.DB_USERNAME,
	host: env.DB_HOSTNAME,
	database: env.DB_NAME,
	password: env.DB_PASSWORD,
	port: env.DB_PORT,
	ssl:
		env.DB_SSL === "true"
			? { require: true, rejectUnauthorized: false }
			: false,
});

export default pool;
