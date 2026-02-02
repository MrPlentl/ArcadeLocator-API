import env from "../../../utils/environment.js";
import { sampleMiddleware } from "../middleware/index.js";

import pkg from "pg";
const { Pool } = pkg;

// @TODO need to remove
const root = (req: any, res: any) => {
	const rootResponse = {
		message: "You suck",
	};
	return res.status(400).send(JSON.stringify(rootResponse));
};

// TESTING ENDPOINTS
const pong = async (req: any, res: any) => {
	console.log("[INDEX] WORKING PONG NEW!");

	const pool = new Pool({
		user: env.DB_USERNAME,
		host: env.DB_HOSTNAME,
		database: env.DB_NAME,
		password: env.DB_PASSWORD,
		port: parseInt(env.DB_PORT || "5432"),
	});

	async function queryDatabase() {
		try {
			const res = await pool.query("SELECT * FROM venue");
			console.log(res.rows);
		} catch (err: any) {
			console.error(err);
		}
	}

	queryDatabase();

	return res.status(200).send("PING");
};

export default {
	pong: [sampleMiddleware, pong],
	root: [sampleMiddleware, root],
};
