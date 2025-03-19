// import env from "../../../utils/environment.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid";
import env from '../../../utils/environment.js';
import { errorResponse, predefinedError } from '../../utilities/error.js';
import { getClientIP } from '../../utilities/helpers.js';
import * as handler from './handlers/auth.js';
// import { __functionName } from '../../utilities/helpers.js';
import Apikey from "../../../database/models/Apikey.class.js";

import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[controller|auth]"); // Sets up the logger with the [app] string prefix


/**
 * Generates a new ApiKey and stores the Hashed Key and a Lookup Hash for retreival 
 * [ Route Controller ]
 * 
 * @param {*} req The HTTP Request object
 * @returns [httpStatucCode, access_token]
 */ 
export async function generateApiKey(userId) {
    const apiKey = crypto.randomBytes(32).toString('hex'); // Generate a random API key

    const storeApiKey = {
        lookup_hash: await handler.generateLookupHash(apiKey),
        hashed_key: await bcrypt.hash(apiKey, 10)
    };
    
    try {
        const response = await Apikey.create(storeApiKey);
        if (response) {
            // # Update User Record
            // @TODO: Update user record (userId) with the new ApiKey id (response.id)
            logger.debug(`Add ApiKey ID: ${response.id} for UserId: ${userId}`);
            return [ 200, { apiKey } ];
        }

        throw new Error("Internal Error: Unable to create API Key at this time.");

    } catch (error) {        
        return errorResponse(error);
    }
};

/**
 * Create an Access Token for the user to authenticate with
 * [ Route Controller ]
 * 
 * @param {*} req The HTTP Request object
 * @returns [httpStatucCode, access_token]
 */
export async function fetchAccessToken(req) {
    logger.trace("fetchAccessToken");
    const { apiKey } = req.body;

    try {        
        if (!apiKey) throw predefinedError('MissingApiKey');

        const apikeyID = await handler.validateApiKey(apiKey); // Validate APIkey in apikey table
        const tokenLife = 3600; // Tokens life is 1 hour (3600 seconds)
        const payload = {};
        
        // @TODO: This needs to be replaced with a real user
        // If API key is valid, use apikeyID to lookup the User and build a user profile JWT
        // Defines what actions the user can perform.
        payload.userAccess = {
            permissions: {
                apiKey: {
                    canCreate: true,
                    canRead: false,
                    canUpdate: true,
                    canDelete: true,
                }
            },
            test: "Testing 123",
            admin: false,
            accessLevel: "Minion",
            apikey_id: apikeyID
        };
        //// END USER CREATION ////////////////////////////////

        // Standard JWT claims
        payload.iss = "https://api.arcadelocator.com";                 // (Issuer): Identifies the authority that issued the token.
        payload.sub = "DisplayName_3";                 // (Subject): The unique identifier for the user.
        payload.aud = "https://api.arcadelocator.com";                 // (Audience): The intended recipient of the token (e.g., an API).
        payload.jti = uuidv4();         // (JWT ID): A unique identifier for the token (prevents replay attacks).

        // Public Claims
        payload.ip = getClientIP(req);  //The IP address the token was issued from (for tracking/fraud detection).
        payload.role = "admin";               // the set of roles that were assigned to the user who is logging in
        payload.applicationId = "Xlr8rV1";
        payload.permissions = {
            apiKey: {
                canCreate: true,
                canRead: false,
                canUpdate: true,
                canDelete: true,
            }
        };
        
        // Generate JWT token
        const JWT_SECRET = env.JWT_SECRET; // Sign the JWT with the secret in the env file
        const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: tokenLife });

        // @TODO: Write to file or cache

        // Additional information for the user to go along side the access_token
        // origin: ibm
        const refresh_token = "Not Suported";
        const token_type = "Bearer";
        const expires_in = tokenLife;
        const expiration = Math.floor(Date.now() / 1000) + tokenLife;
        const scope = env.APP_NAME;

        // Return access_token
        return [ 200, { 
            access_token,
            refresh_token,
            token_type,
            expires_in,
            expiration,
            scope
        } ];

    } catch (error) {
        return errorResponse(error);
    }
};
