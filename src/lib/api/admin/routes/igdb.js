// import env from "../../../utils/environment.js";

import { PERMISSIONS } from "../../utilities/constants.js";

import * as auth from "../middleware/auth.js";
import { setStdRespHeaders } from "../middleware/index.js";
import * as controller from "../controller/igdb.js";
import { getIgdbAccessToken } from "../../services/igdb/controller.js";
import { igdbApikeyCache } from "../../utilities/lruCache.js";

import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[ADMIN|routes|igdb]"); // Sets up the logger with the [app] string prefix

const findMismatchedGames = async (req, res) => {
	logger.trace("findMismatchedGames");
	const [statusCode, response] = await controller.findMismatchedGames(req);
	return res.status(statusCode).send(JSON.stringify(response));
};

export default {
	findMismatchedGames: [
		setStdRespHeaders,
		auth.authenticateToken,
		auth.hasRequiredPermission(PERMISSIONS.ADMIN.VALIDATE),
		findMismatchedGames,
	],
};
