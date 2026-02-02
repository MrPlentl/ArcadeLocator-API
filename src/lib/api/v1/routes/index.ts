import { Request, Response } from "express";
import env from "../../../utils/environment.js";
import { sampleMiddleware } from "../middleware/index.js";

import pkg from "pg";
const { Pool } = pkg;

const root = (req: Request, res: Response) => {
	console.log("Root was HIT!");
	const rootResponse = {
		id: 12,
		name: "Brandon Plentl",
	};
	return res.status(200).send(JSON.stringify(rootResponse));
};

// TESTING ENDPOINTS
const pong = async (req: Request, res: Response) => {
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
