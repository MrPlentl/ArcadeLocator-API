import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

// Needed to safely handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your SQLite database file
const dbPath = path.resolve(__dirname, "../../storage/xlr8r.db");

// Open connection to the SQLite database
let db;

export async function connect() {
	try {
		if (!db) {
			db = await open({
				filename: dbPath,
				driver: sqlite3.Database,
			});
			console.log("✅ Connected to SQLite database:", dbPath);
		}
		return db;
	} catch (error) {
		console.error("❌ Failed to connect to SQLite:", error);
		throw error;
	}
}

// Optional: Helper to close the connection
export async function close() {
	try {
		if (db) {
			await db.close();
			console.log("🛑 SQLite connection closed.");
			db = null;
		}
	} catch (error) {
		console.error("❌ Error closing SQLite connection:", error);
	}
}
