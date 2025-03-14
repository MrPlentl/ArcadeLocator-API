import { setStdRespHeaders } from "../middleware/index.js";
import * as controller from '../controller/auth.js';

import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[routes|auth]"); // Sets up the logger with the [app] string prefix

/**
 * Authenticat the token 
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getAccessToken = async (req, res) => {
    logger.trace("getAccessToken");
    const [ statusCode, response ] = await controller.fetchAccessToken(req);
    return res.status(statusCode).send(JSON.stringify(response));
}

/**
 * Create a new API key in the Apikey table
 *  
 * @TODO: There needs to be a lot of extra validation to verify that only
 * the sysem admin is creating the APIkeys
 * Need to make route PRIVATE
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createApiKey = async (req, res) => {
    logger.trace("createApiKey:", req?.body?.name);
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ error: 'json {apiKey} missing from request body' });
    }

    // Validate APIkey in User DB
    if (!await controller.validateApiKey(apiKey)) {
        return res.status(401).json({ error: 'json Invalid API key' });
    }

    const [ statusCode, response ] = await controller.generateApiKey();

    // Return apikey
    return res.status(statusCode).send(JSON.stringify(response));
}

export default {
    createApiKey: [
        setStdRespHeaders,
        createApiKey
    ],
    getAccessToken: [
        setStdRespHeaders,
        getAccessToken
    ]
};
