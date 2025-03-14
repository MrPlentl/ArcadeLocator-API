import jwt from "jsonwebtoken";
import env from "../../../utils/environment.js";

// @TODO: Remove
export function exampleMiddleware (req, res, next) {
  console.log("Example Middleware Used: Though this doesn't fo anything!");
  next(); // Ensure next() is called
};

// @TODO: Remove
export function sampleMiddleware (req, res, next) {
  console.log("Sample middleware called");
  res.setHeader("Content-Type", "application/json");
  next(); // Ensure next() is called
};

/**
 * 
 * 
 */
export function setStdRespHeaders (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
};

/**
 * Middleware to verify JWT token
 * 
 */
export function authenticateToken (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const JWT_SECRET = env.JWT_SECRET;

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid / Expired token" });
    }
    req.user = decoded;
    console.info(req.user);

    next();
  });
};
