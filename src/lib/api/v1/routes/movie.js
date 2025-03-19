// import env from "../../../utils/environment.js";
import { authenticateToken } from "../middleware/auth.js";
import { setStdRespHeaders } from "../middleware/index.js";
import * as controller from '../controller/movie.js';

import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[routes|movie]"); // Sets up the logger with the [app] string prefix

////////////////////////
// CREATE

/**
 * Returns the information on a single Movie based on the given video game
 * 
 * GET /movie/{movie_id}
 * @param {*} req
 * @param {*} res
 * @returns 
 */
const createMovie = async (req, res) => {
    logger.trace("createMovie:", req?.body?.name);
    const [ statusCode, response ] = await controller.createNewMovie(req);
    return res.status(statusCode).send(JSON.stringify(response)); 
}

////////////////////////
// READ

/**
 * Returns a complete list of movies that are based on Video Games
 * 
 * GET /movies
 * @param {*} req
 * @param {*} res
 * @returns 
 */
const getMovies = async (req, res) => {
    logger.trace("getMovies");
    
    logger.debug(req?.userToken?.permissions?.apiKey?.canCreate);
    logger.debug(req?.userToken?.role);
    logger.debug(req?.userToken?.userAccess?.accessLevel);
    const [ statusCode, response ] = await controller.fetchAllMovies(req);
    return res.status(statusCode).send(JSON.stringify(response));
}

/**
 * Returns the information on a single Movie based on the given video game
 * 
 * GET /movie/{movie_id}
 * @param {*} req
 * @param {*} res
 * @returns 
 */
const getMovieById = async (req, res) => {
    logger.trace("getMovieById:", req?.params?.movieId);
    const [ statusCode, response ] = await controller.fetchMovieById(req);
    return res.status(statusCode).send(JSON.stringify(response)); 
}

////////////////////////
// UPDATE

/**
 * Returns the information on a single Movie based on the given video game
 * 
 * GET /movie/{movie_id}
 * @param {*} req
 * @param {*} res
 * @returns 
 */
const updateMovieInfo = async (req, res) => {
    logger.trace("updateMovieInfo:", req?.params?.movieId);
    const [ statusCode, response ] = await controller.updateMovieById(req);
    return res.status(statusCode).send(JSON.stringify(response)); 
}

////////////////////////
// DELETE

const deleteMovie = async (req, res) => {
    logger.trace("deleteMovie:", req?.params?.movieId);
    const [ statusCode, response ] = await controller.deleteMovieById(req);

    if (statusCode === 204) {
        return res.status(statusCode).send();
    }

    return res.status(statusCode).send(JSON.stringify(response));
};

export default {
    getMovies: [
        setStdRespHeaders,
        authenticateToken,
        getMovies
    ],
    getMovieById: [
        setStdRespHeaders,
        authenticateToken,
        getMovieById
    ],
    updateMovieInfo: [
        setStdRespHeaders,
        authenticateToken,
        updateMovieInfo
    ],
    createMovie: [
        setStdRespHeaders,
        authenticateToken,
        createMovie
    ],
    deleteMovie: [
        setStdRespHeaders,
        authenticateToken,
        deleteMovie
    ]
};
