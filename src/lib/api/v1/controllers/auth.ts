import { Request } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import env from "../../../utils/environment.js";
import { formatErrorResponse, predefinedError } from "../../utils/error.js";
import { getClientIP } from "../../utils/helpers.js";
import * as handler from "./handlers/auth.js";
import { Apikey, User } from "../../../../database/models/index.js";
import { userTokenCache } from "../../../../utils/lruCache.js";
import { log4js } from "../../../../utils/log4js.js";

const logger = log4js.getLogger("[controller|auth]"); // Sets up the logger with the [app] string prefix

/**
 * Generates a new ApiKey and stores the Hashed Key and a Lookup Hash for retreival
 *
 * @param {string} userId The user's ID
 * @returns {[number, object]} [httpStatucCode, access_token]
 */
export async function generateApiKey(userId: string): Promise<[number, object]> {
	const apiKey = crypto.randomBytes(32).toString("hex"); // Generate a random API key

	const storeApiKey = {
		lookup_hash: await handler.generateLookupHash(apiKey),
		hashed_key: await bcrypt.hash(apiKey, 10),
	};

	try {
		const response = await Apikey.create(storeApiKey);
		if (response) {
			// # Update User Record
			// @TODO: Update user record (userId) with the new ApiKey id (response.id)
			logger.debug(`Add ApiKey ID: ${response.id} for UserId: ${userId}`);
			return [200, { apiKey }];
		}
		// This should not be reached
		return [500, { message: "Internal Error: Unable to create API Key at this time." }];

	} catch (error: any) {
		error.details = { sql_error: error.message };
		error.message =
			"Internal Error: Unable to create API Key at this time.";
		return formatErrorResponse(error) as [number, object];
	}
}

/**
 * Create an Access Token for the user to authenticate with
 *
 * @param {*} req The HTTP Request object
 * @returns [httpStatucCode, access_token]
 */
interface JwtPayload {
    iss?: string;
    sub?: string;
    aud?: string;
    jti?: string;
    ip?: string;
    uuid?: string;
    roles?: any;
    accessLevel?: string;
    applicationId?: string;
    permissions?: any;
}

export async function fetchAccessToken(req: Request) {
	logger.trace("fetchAccessToken");
	const apiKey = req.headers["apikey"] as string;

	try {
		if (!apiKey) throw predefinedError("MissingApiKey");
		// Check Cache
		let userToken: any = userTokenCache.get(apiKey);

		if (!userToken) {
			logger.trace(`No Cache found for: ${apiKey}`);

			const apikeyID = await handler.validateApiKey(apiKey);
			const tokenLife = 3600;
			const jwtPayload: JwtPayload = {};

			const user = await User.getByApikeyId(apikeyID);
			if (!user) {
				throw predefinedError("UserNotFound");
			}
			const userPermissions = await User.getPermissionsById(user.id as number);
			const userRoles = await User.getRolesById(user.id as number);

			// Standard JWT claims
			jwtPayload.iss = "https://api.arcadelocator.com";
			jwtPayload.sub = user.display_name;
			jwtPayload.aud = "https://api.arcadelocator.com";
			jwtPayload.jti = uuidv4();

			// Public claims
			jwtPayload.ip = getClientIP(req);
			jwtPayload.uuid = user.uuid;
			jwtPayload.roles = userRoles;
			jwtPayload.accessLevel = userRoles[0].toLowerCase();
			jwtPayload.applicationId = env.APP_ID;
			jwtPayload.permissions = userPermissions;

			// Generate JWT token
			const access_token = jwt.sign(jwtPayload, env.JWT_SECRET || "", {
				expiresIn: tokenLife,
			});

			const decoded = jwt.decode(access_token);

			if (decoded && typeof decoded !== "string") {
				logger.trace(
					"Token issued:",
					new Date(decoded.iat! * 1000).toISOString(),
				);
				logger.trace(
					"Token expires:",
					new Date(decoded.exp! * 1000).toISOString(),
				);
			}
			logger.trace("Current UTC:", new Date().toISOString());

			const refresh_token = "Not Suported";
			const token_type = "Bearer";
			const expires_in = tokenLife;
			const expiration = Math.floor(Date.now() / 1000) + tokenLife;

			const scope = env.APP_NAME;

			userToken = {
				access_token,
				refresh_token,
				token_type,
				expires_in,
				expiration,
				scope,
			};

			userTokenCache.set(apiKey, userToken);
		} else {
			logger.trace(`Cache found for: ${apiKey}`);
			userToken.expires_in =
				userToken.expiration - Math.floor(Date.now() / 1000);
		}

		// Return the users access_token
		return [200, userToken];
	} catch (error: any) {
		return formatErrorResponse(error);
	}
}
