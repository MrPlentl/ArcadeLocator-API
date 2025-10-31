import { readFileSync } from "fs";

const errors = JSON.parse(
	readFileSync("./src/lib/api/utils/errors/errors.json", "utf-8"),
);

export function predefinedError(errorName) {
	return errors[errorName];
}

export function handleErrorMessage(message, errorCode) {
	const errorMessage = {
		code: errorCode ?? 400,
		type: "Error",
		message: message,
	};
	return errorMessage;
}
