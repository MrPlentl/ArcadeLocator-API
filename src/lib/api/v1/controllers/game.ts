import { Request } from "express";
// import env from "../../../utils/environment.js";
import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[controller|game]"); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from "../../utils/error.js";

import { Game } from "../../../../database/models/index.js";

/**
 * CREATE a new Game
 *
 * @param {*} req
 * @returns
 */
export async function createNewGame(req: Request) {
	logger.trace("createNewGame:", req?.body?.name);
	const data = req?.body;
	// VALIDATE DATA HERE
	try {
		const response = (await Game.create(data)) || {};
		return [200, response];
	} catch (error: any) {
		logger.error("SQL Error in Game.create:", error.message);
		error.httpStatusCode = 400;
		let msg =
			"An error occured while creating a new Game. Check the details and please try again. Contact Support if the problem presists.";
		if (error.code == 23505) {
			msg =
				"Duplicate Game Detected: A game already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.";
		}
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * FETCH All Games
 *
 * @param {*} req
 * @returns
 */
export async function fetchAllGames(req: Request) {
	logger.trace("fetchAllGames:", req?.query?.sortBy);
	const orderBy = (req?.query?.sortBy as string) || "id"; // Check if the sortBy parameter was set. default: "id"
	try {
		return [200, await Game.getAll(orderBy)];
	} catch (error: any) {
		logger.error("SQL Error in Game.getAll:", error.message);
		const msg =
			"An error occured while fetching games. Please try again later and contact Support if the problem presists.";
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * FETCH Game by Id
 *
 * @param {*} req
 * @returns
 */
export async function fetchGameById(req: Request) {
	logger.trace("fetchGameById:", req?.params?.gameId);
	const id: number = Number(req?.params?.gameId) || 99;
	try {
		const response = await Game.getById(id);
		return [200, response];
	} catch (error: any) {
		logger.error("SQL Error in Game.getById:", error.message);
		const msg = `An error occured while fetching the game with id: ${id}. Please try again later and contact Support if the problem presists.`;
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * UPDATE Game
 *
 * @param {*} req
 * @returns
 */
export async function updateGameById(req: Request) {
	logger.trace("updateGameById:", req?.params?.gameId);
	const id: number = Number(req?.params?.gameId) || 99;
	const data = req?.body;

	try {
		const response = (await Game.update(id, data)) || {};
		return [200, response];
	} catch (error: any) {
		logger.error("SQL Error in Game.update:", error.message);
		error.httpStatusCode = 400;
		let msg =
			"An error occured while creating a new Game. Check the details and please try again. Contact Support if the problem presists.";
		if (error.code == 23505) {
			msg =
				"Duplicate Game Detected: A game already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.";
		}
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * DELETE Game
 *
 * @param {*} req
 * @returns
 */
export async function deleteGameById(req: Request) {
	logger.trace("deleteGameById:", req?.params?.gameId);
	try {
		const id: number = Number(req?.params?.gameId);
		const response = await Game.delete(id);
		return [204, response];
	} catch (error: any) {
		logger.error("SQL Error in Game.delete:", error.message);
		error.httpStatusCode = 404;
		const msg = "Error Deleting game";
		return formatErrorResponse(sqlError(error, msg));
	}
}
