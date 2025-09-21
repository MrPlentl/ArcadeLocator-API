// import env from "../../../utils/environment.js";

// @TODO Remove
export function sampleMiddleware(req, res, next) {
	console.log("Sample middleware called");
	res.setHeader("Content-Type", "application/json");
	next(); // Ensure next() is called
}

/**
 *
 *
 */
export function setStdRespHeaders(req, res, next) {
	console.log("setStdRespHeaders");
	res.setHeader("Content-Type", "application/json");
	next();
}
