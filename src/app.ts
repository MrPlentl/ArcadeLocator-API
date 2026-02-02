/* eslint-disable no-undef */
/**
 * The Acade Locator API can be used to find nearby Arcades, return information about individual arcades as well as updating that information
 * @module app (Arcade Locator API)
 * @version 0.1.0
 * @author R. Brandon Plentl <bplentl@gmail.com>
 */
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import serverRequestLog from "morgan";
import * as eov from "express-openapi-validator";
import rateLimit from "express-rate-limit";
import { log4js } from "./utils/log4js.js";
import { getAccessLogStream } from "./utils/index.js";

// API Specs
import apiV1 from "./lib/api/v1/index.js";
import apiAdmin from "./lib/api/admin/index.js";

// Initialize Logger for App context
const logger = log4js.getLogger("[app]");

const app = express();

////////////////
// Rate Limiters
////////////////

// Global Rate Limit
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100,
	message: "Rate Limit Reached, too many requests. Please try again later.",
	standardHeaders: "draft-8",
});

// Authentication Rate Limit
const authLimiter = rateLimit({
	windowMs: 30 * 60 * 1000, // 30 minutes
	limit: 5,
	message: "Rate Limit Reached. Do not continuously authenticate your Api Key.",
	standardHeaders: "draft-8",
});

// Apply Rate Limiters
app.use("/", globalLimiter);
app.use("/identity/token", authLimiter);

////////////////
// Middleware
////////////////

// Body Parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json());

// Logging Middleware
app.use(
	serverRequestLog("combined", {
		stream: getAccessLogStream(import.meta.url),
	})
);
app.use(serverRequestLog("dev"));

////////////////
// OpenAPI Validator
////////////////
app.use(eov.middleware(apiV1));
app.use(eov.middleware(apiAdmin));

////////////////
// Error Handling
////////////////

// 404 Catcher
app.use((_req: Request, res: Response, _next: NextFunction) => {
	res.status(404).json({ message: "Not Found" });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
	res.status(err.status || 500).json({
		message: err.message,
		errors: err.errors,
	});
});

export default app;
