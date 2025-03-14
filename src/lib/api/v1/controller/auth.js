// import env from "../../../utils/environment.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../../../utils/environment.js';
import Apikey from "../../../database/models/Apikey.class.js";

import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[controller|auth]"); // Sets up the logger with the [app] string prefix

/**
 * 
 * @param {*} apiKey 
 * @returns 
 */
async function generateLookupHash(apiKey) {
    logger.trace("generateLookupHash:", 'apikey-****');
    try {
        return crypto.createHash('sha256').update(apiKey).digest('hex').slice(0, 16);
    } catch (error) {
        logger.error(`${error.status}: ${error.message}`);
    }   
}

/**
 * Generates a new ApiKey and stores the Hashed Key and a Lookup Hash for retreival 
 * 
 * @returns 
 */ 
export async function generateApiKey() {
    // const apiKey = crypto.randomBytes(32).toString('hex'); // Generate a random API key
    // logger.debug("apiKey:",apiKey);
    // const hashedKey = await bcrypt.hash(apiKey, 10);
    // logger.debug("hashedKey:",hashedKey);
    // const lookupHash = generateLookupHash(apiKey);
    // logger.debug("lookupHash:",lookupHash);
    const apiKey = crypto.randomBytes(32).toString('hex'); // Generate a random API key
    logger.debug("apiKey:",apiKey);
    const hashedKey = await bcrypt.hash(apiKey, 10);
    logger.debug("hashedKey:",hashedKey);
    const lookupHash = await generateLookupHash(apiKey);
    logger.debug("lookupHash:",lookupHash);

    const storeApiKey = {
        lookup_hash: lookupHash,
        hashed_key: hashedKey
    };
    
    try {
        const response = await Apikey.create(storeApiKey);
        if(response) {
            return [ 200, { apiKey } ];
        }
        throw("Unable to create API Key");

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
async function fetchApikeyByLookupHash(lookupHash) {
    logger.trace("fetchApikeyByLookupHash:", lookupHash);
    try {
        const response = await Apikey.getByLookupHash(lookupHash);
        return response;
    } catch (error) {
        logger.error(`${error.status}: ${error.message}`);
        return [ 404, error ];
    }
};

export async function validateApiKey(providedKey) {
    const lookupHash = await generateLookupHash(providedKey);
    
    // Get the stored hash using the lookup hash
    const apikeyRecord = await fetchApikeyByLookupHash(lookupHash);

    if (!apikeyRecord?.hashed_key) {
        throw({
            status: "Error",
            message: "Invalid {apiKey} used"
        });
    }

     // return apikeyRecord ID if there is a match
    if (await bcrypt.compare(providedKey, apikeyRecord?.hashed_key)) {
        return apikeyRecord?.id;
    }

    return false;
};

const verifyApikeyIsSet = async (apiKey) => {
    if (!apiKey) {
        throw({
            status: "Error",
            message: "{apiKey} missing from request body"
        });
    }
};

export async function fetchAccessToken(req) {
    logger.trace("fetchAccessToken");
    const { apiKey } = req.body;

    logger.info("Authenticating Api Key!");
    // Verify that an apikey was sent
    try {
        await verifyApikeyIsSet(apiKey);
    } catch (error) {
        logger.error(`${error.status}: ${error.message}`);
        return [ 400, error ];
    }


    // Validate APIkey in apikey table

    try {
        const apikeyID = await validateApiKey(apiKey);
        
        // If API key is valid, use apikeyID to lookup the User and build a user profile JWT
        const userAccess = {
            test: "Testing 123",
            admin: false,
            accessLevel: "Minion",
            apikey_id: apikeyID
        };

        // Generate JWT token
        // Sign the JWT with the secret in the env file
        const JWT_SECRET = env.JWT_SECRET;
        const access_token = jwt.sign(userAccess, JWT_SECRET, { expiresIn: '1h' });

        const refresh_token = "Not Suported";
        const token_type = "Bearer";
        const expires_in = 3600;
        const expiration = Math.floor(Date.now() / 1000) + 3600;
        const scope = "Arcade Locator API";
        
        // Write to file or cache

        // Return access_token
        //return res.status(200).send(JSON.stringify({ access_token }));
        return [ 200, { 
            access_token,
            refresh_token,
            token_type,
            expires_in,
            expiration,
            scope
        } ];

    } catch (error) {
        logger.error(`${error.status}: ${error.message}`);
        return [ 401, error ];
    }
};
