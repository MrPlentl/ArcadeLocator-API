// NOTE: NOT WORKING
// Using sequelize.json
import env from "../../utils/environment.js";

const development = {
	username: "xlr8ruser",
	password: "w4cE2e2PAWbpWeyqUDh4JdQkCuKq26a8",
	database: env.DB_NAME,
	host: env.DB_HOSTNAME,
	port: env.DB_PORT,
	dialect: "postgres",
};

const test = {
	username: env.CI_DB_USERNAME,
	password: env.CI_DB_PASSWORD,
	database: env.CI_DB_NAME,
	host: "127.0.0.1",
	port: 3306,
	dialect: "postgres",
};
const production = {
	username: env.DB_USERNAME,
	password: env.DB_PASSWORD,
	database: env.DB_NAME,
	host: env.DB_HOSTNAME,
	port: env.DB_PORT,
	dialect: "postgres",
};

export default {
	production,
	development,
	test,
};
