export const __functionName = () => {
	// const stackLine = (new Error().stack.split("\n")[2].trim()).split("at ")[1].split(" (")[0];
	// const functionName = stackLine.split("at ")[1].split(" (")[0];
	return new Error().stack
		.split("\n")[2]
		.trim()
		.split("at ")[1]
		.split(" (")[0];
};

/**
 * Checks the given date and returns true if the date is in the past
 *
 * @param {*} date
 * @returns bool
 */
export function hasExpiredDate(date) {
	if (!date) return true;
	const givenDate = new Date(date);
	const now = new Date();

	if (givenDate > now) {
		return false;
	}

	return true;
}

export const getClientIP = (req) => {
	return (
		req.headers["x-forwarded-for"]?.split(",")[0] ||
		req.connection.remoteAddress
	);
};

/**
 *
 * @param {*} value
 * @returns
 */
export const getLength = (value) => {
	if (value == null) {
		// Handles null and undefined
		return 0;
	}

	if (typeof value === "string" || Array.isArray(value)) {
		return value.length;
	}

	if (typeof value === "object") {
		return Object.keys(value).length;
	}

	if (typeof value === "number") {
		return value.toString().length;
	}

	// For other types like boolean, function, symbol, etc.
	return 0;
};

/**
 * Returns the standard api reponse
 *
 * @param {*} resp
 * @returns
 */
export const standardResponse = (resp, includeCount = true) => {
	if (resp?.error) {
		return JSON.stringify(resp);
	}

	return JSON.stringify({
		...(includeCount && { count: getLength(resp) }),
		data: resp,
	});
};
