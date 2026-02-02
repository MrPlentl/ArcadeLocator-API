import { createServer } from "http";
import env from "./lib/utils/environment.js";
import app from "./app.js";
import { log4js } from "./utils/log4js.js";
import { validateStartup } from "./utils/validation/startup.js"; // Validate Startup

const logger = log4js.getLogger("[ArcadeLocatorAPI]");

async function startServer() {
	logger.info(`[STARTING] ${env.APP_NAME}`);

	/////////////////////////////////
	// Validate Startup
	/////////////////////////////////
	try {
		if (!validateStartup()) {
			logger.error("VALIDATION FAILED - Exiting...");
			process.exit(1);
		}
	} catch (error) {
		logger.error("Validation crashed:", error);
		process.exit(1);
	}

	/////////////////////////////////
	// CLI Argument Parsing
	/////////////////////////////////
	// let ctr = 0;
	// process.argv.forEach((argValue) => {
	// 	if (ctr > 1) {
	// 		switch (argValue) {
	// 			case "runAll":
	// 				logger.info("runAll=true");
	// 				break;
	// 			default:
	// 				// It is often safer to log a warning rather than crash on unknown args, 
	// 				// but keeping your logic here:
	// 				throw new Error(`Unknown Argument Detected => "${argValue}"`);
	// 		}
	// 	}
	// 	ctr++;
	// });

	/////////////////////////////////
	// Start HTTP Server
	/////////////////////////////////
	const server = createServer(app);
	
	server.listen(env.HTTP_PORT, () => {
		logger.info(`Listening on port ${env.HTTP_PORT}`);
	});

	// Optional: Handle graceful shutdown
	process.on('SIGTERM', () => {
			logger.info('SIGTERM signal received: closing HTTP server');
			server.close(() => {
					logger.info('HTTP server closed');
			});
	});
}

// Execute
startServer();
