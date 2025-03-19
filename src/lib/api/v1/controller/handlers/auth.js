import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { hasExpiredDate } from '../../../utilities/helpers.js';
import { predefinedError } from '../../../utilities/error.js';
import Apikey from "../../../../database/models/Apikey.class.js";
import { log4js } from "../../../../../utils/log4js.js";
const logger = log4js.getLogger("[controller|handlers|auth]"); // Sets up the logger with the [app] string prefix

/**
 * Creates a lookup has for the given apiKey that will be used to locate the valid apiKey Hash
 * 
 * @param {*} apiKey 
 * @returns 
 */
export async function generateLookupHash(apiKey) {
    logger.trace("generateLookupHash:", 'apikey-****');
    return crypto.createHash('sha256').update(apiKey).digest('hex').slice(0, 16);
}

/**
 * Get the stored hash using the lookup hash
 * 
 * @param {*} req 
 * @returns 
 */
async function fetchApikeyByLookupHash(lookupHash) {
    logger.trace("fetchApikeyByLookupHash:", lookupHash);
    const apikeyRecord = await Apikey.getByLookupHash(lookupHash);

    if (hasExpiredDate(apikeyRecord.expires_at)) {
        const newError = new Error();
        Object.assign(newError, predefinedError('ApiKeyExpired'));
        newError.details = {apikey_id: `${apikeyRecord?.id}.${lookupHash}`, expired_at: apikeyRecord.expires_at};
        throw newError;
    };

    return apikeyRecord;
};

/**
 * Validates that the give apiKey is actually a vaild ApiKey by using a lookup hash
 * 
 * @param {*} providedKey 
 * @returns 
 */
export async function validateApiKey(providedKey) {
    logger.trace("validateApiKey");
    const lookupHash = await generateLookupHash(providedKey);
    
    // Get the stored hash using the lookup hash
    const apikeyRecord = await fetchApikeyByLookupHash(lookupHash);

     // return apikeyRecord ID if there is a match
    if ( await bcrypt.compare(providedKey, apikeyRecord?.hashed_key) ) { return apikeyRecord?.id; }

    throw predefinedError('ApiKeyExpired');
};
