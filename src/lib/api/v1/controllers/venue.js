// import env from "../../../utils/environment.js";
import { log4js } from "../../../../utils/log4js.js";
const logger = log4js.getLogger("[controller|venue]"); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from "../../utils/error.js";

import { Venue } from "#dbModels";

/**
 * FETCH All Venues
 *
 * @param {*} req
 * @returns
 */
export async function fetchVenue(req) {
	logger.trace("fetchVenue");
	const venueId = req?.params?.venueId || 0;
	try {
		return [200, await Venue.getById(venueId)];
	} catch (error) {
		logger.error("SQL Error in Venue.getById:", error.message);
		const msg =
			"An error occured while fetching movies. Please try again later and contact Support if the problem presists.";
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * FETCH All Venues
 *
 * @param {*} req
 * @returns
 */
export async function fetchAllVenues(req) {
	logger.trace("fetchAllVenues:", req?.query?.sortBy);
	const orderBy = req?.query?.sortBy || "id"; // Check if the sortBy parameter was set. default: "id"
	try {
		return [200, await Venue.getAll(orderBy)];
	} catch (error) {
		logger.error("SQL Error in Venue.getAll:", error.message);
		const msg =
			"An error occured while fetching movies. Please try again later and contact Support if the problem presists.";
		return formatErrorResponse(sqlError(error, msg));
	}
}

/**
 * FETCH Venues by params
 *
 * @param {*} req
 * @returns
 */
export async function fetchVenuesByParams(req) {
	logger.trace("fetchVenuesByParams:", req?.query);
	const zip = req?.query?.zip || null;
	const distance = req?.query?.distance || 5;
	const name = req?.query?.name || null;

	try {
		if (!zip && !name) {
			return [400, { message: "Missing zipcode or name to search by" }];
		}

		let conditions = [];

		if (zip) {
			conditions.push(`z.origin = ${zip}`);
		}

		if (name) {
			conditions.push(`v.name ILIKE '${name}%'`);
		}

		if (distance) {
			conditions.push(`z.distance <= '${distance}'`);
		}

		const sqlWhere = conditions.length ? conditions.join(" AND ") : "";

		let tableName;
		if (distance > 50) {
			tableName = "zipdistance100";
		} else if (distance > 25) {
			tableName = "zipdistance50";
		} else if (distance > 5) {
			tableName = "zipdistance25";
		} else {
			tableName = "zipdistance05";
		}

		return [200, await Venue.getAll(sqlWhere, tableName)];
	} catch (error) {
		logger.error("SQL Error in Venue.getAll:", error.message);
		const msg =
			"An error occured while fetching venues. Please try again later and contact Support if the problem presists.";
		return formatErrorResponse(sqlError(error, msg));
	}
}
