// import env from "../../../utils/environment.js";
import { PERMISSIONS } from "../../utilities/constants.js";

import * as auth from "../middleware/auth.js";
import { setStdRespHeaders } from "../middleware/index.js";
import * as controller from '../controller/venue.js';
import { standardResponse } from "../../utilities/helpers.js";

import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[routes|venue]"); // Sets up the logger with the [app] string prefix

////////////////////////
// READ

/**
 * Returns a complete list of movies that are based on Video Games
 * 
 * GET /venue
 * @param {*} req
 * @param {*} res
 * @returns 
 */
const getVenue = async (req, res) => {
    logger.trace("getVenue");
    const [ statusCode, response ] = await controller.fetchVenue(req);
    return res.status(statusCode).send(standardResponse(response, false));
}

/**
 * Returns a list of venues that match the search queries
 * 
 * GET /venue/search
 * @param {*} req
 * @param {*} res
 * @returns 
 */
const getVenuesByParams = async (req, res) => {
    logger.trace("getVenuesByParams");
    const [ statusCode, response ] = await controller.fetchVenuesByParams(req);
    return res.status(statusCode).send(standardResponse(response));
}

export default {
    getVenuesByParams: [
        setStdRespHeaders,
        auth.authenticateToken,
        auth.hasRequiredPermission(PERMISSIONS.READ),
        getVenuesByParams
    ],
    getVenue: [
        setStdRespHeaders,
        auth.authenticateToken,
        auth.hasRequiredPermission(PERMISSIONS.READ),
        getVenue
    ]
};