import { readFileSync } from "fs";

const errors = JSON.parse(
	readFileSync("./src/lib/api/utilities/errors/errors.json", "utf-8"),
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

// export const __functionName = () => {
//     // const stackLine = (new Error().stack.split("\n")[2].trim()).split("at ")[1].split(" (")[0];
//     // const functionName = stackLine.split("at ")[1].split(" (")[0];
//     return((new Error().stack.split("\n")[2].trim()).split("at ")[1].split(" (")[0]);
// };
