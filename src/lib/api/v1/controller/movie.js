// import env from "../../../utils/environment.js";
import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[controller|movie]"); // Sets up the logger with the [app] string prefix

import Movie from "../../../database/models/Movie.class.js";

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
      return [ 200, await Movie.getAll(orderBy) ];
    } catch (error) {
        logger.error(`${error.status}: ${error.message}`);
        return [ 404, error ];
    }
};

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
        const response = await Movie.getById(id) || {};
        return [ 200, response ];
    } catch (error) {
      logger.error(`${error.status}: ${error.message}`);
      return [ 404, error ];
    }
};

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
    // VALIDATE DATA HERE
    try {
        const response = await Movie.update(id, data) || {};
        return [ 200, response ];
    } catch (error) {
      logger.error(`${error.status}: ${error.message}`);
      return [ 404, error ];
    }
};

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
    return [ 204, response ];
  } catch (error) {
    logger.error(`${error.status}: ${error.message}`);
    return [ 404, error ];
  }
};

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
        const response = await Movie.create(data) || {};
        return [ 200, response ];
    } catch (error) {
      logger.error(`${error.status}: ${error.message}`);
      return [ 404, error ];
    }
};
