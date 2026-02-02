// @TODO Remove   
import { log4js } from "../../utils/log4js.js"; // log4js is a simple to use log library
const logger = log4js.getLogger("[validateEnvironment]");

export async function validateEnvironment(): Promise<boolean> {
	logger.trace("[STARTING]");

	const requiredEnvVars = ["APP_NAME", "APP_ENV"];
	const missingVars = requiredEnvVars.filter((key) => !(key in process.env));

	if (missingVars.length > 0) {
		missingVars.forEach((key) => {
			logger.error(`Environment is missing the following key: '${key}'`);
		});
		logger.error("[FAILED] ENVIRONMENT VALIDATION");
		return false;
	}

	logger.info("[PASSED] ENVIRONMENT VALIDATION");
	return true;
}
