import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[admin|controller|igdb]"); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from "../../utils/error.js";
import { searchGameByName } from "../../../../services/igdb/controller.js";

// Games
import Game from "../../../../../database/models/Game.js";

export async function findMismatchedGames(req) {
	logger.trace("findMismatchedGames");
	// Connect to DB table `games` and find the games missing an IGDB ID

	// Get the list of games missing IGDB IDs
	const games = await Game.getAllGamesMissingIgdbId();

	// Foreach game, search IGDB
	try {
		const results = [];

		for (const game of games) {
			const response = await searchGameByName(game.title, [52]);
			if (response) {
				logger.debug("Update Game:", game);
				logger.debug("IGDB_ID:", response[0]?.id);

				const updateGame = {
					title: game.title,
					igdb_id: response[0]?.id,
					igdb_slug: response[0]?.slug,
					updated_by: "bplentl",
				};

				const row = await Game.update(game.id, updateGame);
				logger.debug(row);
			}
			results.push(response);
		}
		const response = results;
		return [200, response];
	} catch (error) {
		logger.error("SQL Error in findMismatchedGames:", error.message);
		error.httpStatusCode = 400;
		let msg =
			"An error occured while finding mismatched games. Check the details and please try again. Contact Support if the problem presists.";
		if (error.code == 23505) {
			msg =
				"Duplicate IGDB record Detected: A IGDB record already exists with that id. Check the details and please try again. Contact Support if the problem presists.";
		}
		return formatErrorResponse(sqlError(error, msg));
	}
}
