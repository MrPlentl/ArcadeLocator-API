import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const getDirectory = (fileLocation) => {
	const __filename = fileURLToPath(fileLocation);
	return path.dirname(__filename);
};

const getAccessLogDirectory = (fileLocation) => {
	// Define the log file path
	const logDirectory = path.join(getDirectory(fileLocation), "../logs");
	const logFilePath = path.join(logDirectory, "access.log");

	// Ensure the logs directory exists
	if (!fs.existsSync(logDirectory)) {
		fs.mkdirSync(logDirectory, { recursive: true });
	}

	return logFilePath;
};

const getAccessLogStream = (fileLocation) => {
	return fs.createWriteStream(getAccessLogDirectory(fileLocation), {
		flags: "a",
	});
};

export { getDirectory, getAccessLogStream };
