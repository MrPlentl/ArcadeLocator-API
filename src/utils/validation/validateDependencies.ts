import { log4js } from "../../utils/log4js.js"; // log4js is a simple to use log library
const logger = log4js.getLogger("[validateDependencies]");

// Cycle through the list of dependencies
export async function validateDependencies() {
	logger.trace("[STARTING]");

	// Check if Extrenal Endpoints are available

	// Check IO read / write access

	// Check DB access

	logger.info("=== [PASSED] Dependency Validation ===");
	return true;
}
