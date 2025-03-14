/* eslint-disable no-undef */
/**
 * The Acade Locator API can be used to find nearby Arcades, return information about individual arcades as well as updating that information
 * @module app (Arcade Locator API)
 * @version 0.0.1
 * @author R. Brandon Plentl <bplentl@gmail.com>
 */
import 'dotenv/config'; // Used to automatically read in the .env file
import express from 'express'; // ExpressJS web framework
import bodyParser from 'body-parser'; // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
import serverRequestLog from 'morgan'; // HTTP request logger middleware for node.js
import { createServer } from 'http'; // The HTTP server and client
import * as eov from 'express-openapi-validator'; // Used to validate and use OpenAPI Specs
import rateLimit from 'express-rate-limit'; // Setup up rate limit logic to guard against abuse
import env from './lib/utils/environment.js';

// Logging
import { log4js } from "./utils/log4js.js"; // log4js is a simple to use log library
const logger = log4js.getLogger("[app]"); // Sets up the logger with the [app] string prefix

// Validation
import { validateEnvironment } from "./utils/validation/validateEnvironment.js"; // Validates that the necessary information is available to run application
import { validateDependencies } from "./utils/validation/validateDependencies.js"; // Validates that the necessary information is available to run application

// API Specs
import apiV1 from './lib/api/v1/index.js';

// Used for writing to the server access log
import { getAccessLogStream } from './utils/index.js';

/////////////////////////////////
// STARING VALIDATION of the APP
/////////////////////////////////

logger.info(`[STARTING] ${env.APP_NAME} ===`)  // Access .env variables

// Validate the .env file variables required
// Validate any dependencies that are required to function properly
if (!await validateEnvironment() || !await validateDependencies()) {
  logger.error("VALIDATION FAILED");
  process.exit(); // Kills the App if validation fails
}

// Currently NOT USED
// This processes any arguments that might be passed in when the app is started
// ex. `npm run start runAll`
let ctr=0;
process.argv.forEach((argValue) => {
  if (ctr > 1) {
      switch(argValue) {
          case "runAll":
              logger.info("runAll=true");
              break;
          default:
              throw new Error (`Unknown Argument Detected => "` + argValue + `"`);
      }
  }
  ctr++;
});

///////////////////////////
// STARTING EXPRESS SERVER
///////////////////////////
const app = express();

////////////////
// Rate Limiter

// Global Rate Limit
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Rate Limit Reached, too many requests. Please try again later.",
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
});

// Apply the rate limiting middleware to all requests.
app.use('/', limiter);

// Rate Limiter for getting the Authentication token
const authenticateRateLimiter = rateLimit({
	windowMs: 30 * 60 * 1000, // 30 minutes
	limit: 5, // Limit each IP to 5 requests per time `window` (here, per 30 minutes).
  message: "Rate Limit Reached, too many requests to authenticate apiKey with server. Please try again in 30 minutes. WARNING: Do not continuously authenticate your Api Key to get a new Auth token. Auth Tokens are valid for 60 minutes.",
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header

});

// Apply the rate limiting middleware to all requests.
app.use('/identity/token', authenticateRateLimiter);

// Install bodyParsers for the request types your API will support
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json());

//////////////////////////////
// Attach morgan server logger
// 'combined' -> ::1 - - [05/Mar/2025:12:07:37 +0000] "GET /ping HTTP/1.1" 200 4 "-" "PostmanRuntime/7.43.0"
// 'common'   -> ::1 - - [05/Mar/2025:12:10:01 +0000] "GET /pong HTTP/1.1" 200 4
// 'dev'      -> GET /pong 200 6.365 ms - 4
// 'short'    -> ::1 - GET /pong HTTP/1.1 200 4 - 7.818 ms
// 'tiny'     -> GET /pong 200 4 - 6.693 ms
//////////////////////////////
app.use(serverRequestLog('combined', { stream: getAccessLogStream(import.meta.url) }));
app.use(serverRequestLog('dev')); // Logs to console in 'dev' format

////////////////////////////////////
// express-openapi-validator
// Setup express-openapi-validator to use the given OpenAPI Spec to handle requests
////////////////////////////////////
// With auto-wired operation handlers, you don't have to declare your routes!
// See api.yaml for x-eov-* vendor extensions
app.use( eov.middleware(apiV1) );

// @TODO: I have no idea what is happening here
// Create a custom error handler
app.use((err, req, res, next) => {
  // format errors
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

// Starts up the HTTP server, ready to receive requests
createServer(app).listen(env.HTTP_PORT);
logger.info(`Listening on port ${env.HTTP_PORT}`);

export default app;
