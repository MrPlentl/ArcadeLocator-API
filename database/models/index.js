import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";

import env from "../../utils/environment";
import configData from "../config/config.json";

// Get current file name and directory in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = env.NODE_ENV || "development";
console.log(nodeEnv);
const config = configData[nodeEnv];
const db = {};

let sequelize;
if (config.use_env_variable) {
	sequelize = new Sequelize(env[config.use_env_variable], config);
} else {
	sequelize = new Sequelize(
		config.database,
		config.username,
		config.password,
		config,
	);
}
console.log(nodeEnv);

// Read models dynamically
fs.readdirSync(__dirname)
	.filter((file) => {
		return (
			file.indexOf(".") !== 0 &&
			file !== path.basename(__filename) &&
			file.slice(-3) === ".js" &&
			file.indexOf(".test.js") === -1
		);
	})
	.forEach(async (file) => {
		const modelImport = await import(path.join(__dirname, file));
		const model = modelImport.default(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
	});

Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
