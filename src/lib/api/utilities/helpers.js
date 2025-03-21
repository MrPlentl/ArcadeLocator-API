export const __functionName = () => {
    // const stackLine = (new Error().stack.split("\n")[2].trim()).split("at ")[1].split(" (")[0];
    // const functionName = stackLine.split("at ")[1].split(" (")[0];
    return((new Error().stack.split("\n")[2].trim()).split("at ")[1].split(" (")[0]);
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
    
    if (givenDate > now) { return false; }

    return true;
};

export const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
};