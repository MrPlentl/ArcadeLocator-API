import { log4js } from "../../utils/log4js.js"; // log4js is a simple to use log library
const logger = log4js.getLogger("[validateEnvironment]");

export async function validateEnvironment() {
	logger.trace("[STARTING]");

	let error = false;
	const requiredEnvVars = ["APP_NAME", "APP_ENV"];

	requiredEnvVars.forEach((key) => {
		// eslint-disable-next-line no-undef
		if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
			logger.error(`Environment is missing the following key: '${key}'`);
			error = true;
		}
	});

	if (error) {
		logger.error("[FAILED] ENVIRONMENT VALIDATION");
		return false;
	}

	logger.info("[PASSED] ENVIRONMENT VALIDATION");
	return true;
}
