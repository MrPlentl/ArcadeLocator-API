import { Request, Response } from "express";
import { PERMISSIONS } from "../../utils/constants.js";

import * as auth from "../middleware/auth.js";
import { setStdRespHeaders } from "../middleware/index.js";
import * as controller from "../controllers/game.js";

import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[routes|game]"); // Sets up the logger with the [app] string prefix

////////////////////////
// CREATE

/**
 * Returns the information on a single Game based on the given video game
 *
 * GET /game/{game_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const createGame = async (req: Request, res: Response) => {
	logger.trace("createGame:", req?.body?.name);
	const [statusCode, response] = await controller.createNewGame(req);
	return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// READ

/**
 * Returns a complete list of games that are based on Video Games
 *
 * GET /games
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getGames = async (req: Request, res: Response) => {
	logger.trace("getGames");
	const [statusCode, response] = await controller.fetchAllGames(req);
	return res.status(statusCode as number).send(JSON.stringify(response));
};

/**
 * Returns the information on a single Game based on the given video game
 *
 * GET /game/{game_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getGameById = async (req: Request, res: Response) => {
	logger.trace("getGameById:", req?.params?.gameId);
	const [statusCode, response] = await controller.fetchGameById(req);
	return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// UPDATE

/**
 * Returns the information on a single Game based on the given video game
 *
 * GET /game/{game_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const updateGameInfo = async (req: Request, res: Response) => {
	logger.trace("updateGameInfo:", req?.params?.gameId);
	const [statusCode, response] = await controller.updateGameById(req);
	return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// DELETE

const deleteGame = async (req: Request, res: Response) => {
	logger.trace("deleteGame:", req?.params?.gameId);
	const [statusCode, response] = await controller.deleteGameById(req);

	if (statusCode === 204) {
		return res.status(statusCode as number).send();
	}

	return res.status(statusCode as number).send(JSON.stringify(response));
};


export default {
	getGames: [
		setStdRespHeaders,
		auth.authenticateToken,
		auth.hasRequiredPermission(PERMISSIONS.READ),
		getGames,
	],
	getGameById: [
		setStdRespHeaders,
		auth.authenticateToken,
		auth.hasRequiredPermission(PERMISSIONS.READ),
		getGameById,
	],
	updateGameInfo: [
		setStdRespHeaders,
		auth.authenticateToken,
		auth.hasRequiredPermission(PERMISSIONS.GAME.UPDATE),
		updateGameInfo,
	],
	createGame: [
		setStdRespHeaders,
		auth.authenticateToken,
		auth.hasRequiredPermission(PERMISSIONS.GAME.CREATE),
		createGame,
	],
	deleteGame: [
		setStdRespHeaders,
		auth.authenticateToken,
		auth.hasRequiredPermission(PERMISSIONS.GAME.DELETE),
		deleteGame,
	],
};
