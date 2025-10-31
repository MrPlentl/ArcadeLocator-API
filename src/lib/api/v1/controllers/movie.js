// import env from "../../../utils/environment.js";
import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[controller|movie]"); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from "../../utils/error.js";

import Movie from "../../../../../database/models/Movie.js";

/**
 * CREATE a new Movie
 *
 * @param {*} req
 * @returns
 */
export async function createNewMovie(req) {
	logger.trace("createNewMovie:", req?.body?.name);
	const data = req?.body;
	// VALIDATE DATA HERE
	try {
		const response = (await Movie.create(data)) || {};
		return [200, response];
	} catch (error) {
		logger.error("SQL Error in Movie.create:", error.message);
		error.httpStatusCode = 400;
		let msg =
			"An error occured while creating a new Movie. Check the details and please try again. Contact Support if the problem presists.";
		if (error.code == 23505) {
			msg =
				"Duplicate Movie Detected: A movie already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.";
		}
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * FETCH All Movies
 *
 * @param {*} req
 * @returns
 */
export async function fetchAllMovies(req) {
	logger.trace("fetchAllMovies:", req?.query?.sortBy);
	const orderBy = req?.query?.sortBy || "id"; // Check if the sortBy parameter was set. default: "id"
	try {
		return [200, await Movie.getAll(orderBy)];
	} catch (error) {
		logger.error("SQL Error in Movie.getAll:", error.message);
		const msg =
			"An error occured while fetching movies. Please try again later and contact Support if the problem presists.";
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * FETCH Movie by Id
 *
 * @param {*} req
 * @returns
 */
export async function fetchMovieById(req) {
	logger.trace("fetchMovieById:", req?.params?.movieId);
	const id = req?.params?.movieId || 99;
	try {
		const response = await Movie.getById(id);
		return [200, response];
	} catch (error) {
		logger.error("SQL Error in Movie.getById:", error.message);
		const msg = `An error occured while fetching the movie with id: ${id}. Please try again later and contact Support if the problem presists.`;
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * UPDATE Movie
 *
 * @param {*} req
 * @returns
 */
export async function updateMovieById(req) {
	logger.trace("updateMovieById:", req?.params?.movieId);
	const id = req?.params?.movieId || 99;
	const data = req?.body;

	try {
		const response = (await Movie.update(id, data)) || {};
		return [200, response];
	} catch (error) {
		logger.error("SQL Error in Movie.update:", error.message);
		error.httpStatusCode = 400;
		let msg =
			"An error occured while creating a new Movie. Check the details and please try again. Contact Support if the problem presists.";
		if (error.code == 23505) {
			msg =
				"Duplicate Movie Detected: A movie already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.";
		}
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * DELETE Movie
 *
 * @param {*} req
 * @returns
 */
export async function deleteMovieById(req) {
	logger.trace("deleteMovieById:", req?.params?.movieId);
	try {
		const id = req?.params?.movieId;
		const response = await Movie.delete(id);
		return [204, response];
	} catch (error) {
		logger.error("SQL Error in Movie.delete:", error.message);
		error.httpStatusCode = 404;
		const msg = "Error Deleting movie";
		return formatErrorResponse(sqlError(error, msg));
	}
}
