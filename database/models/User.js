/**
 * Contains all the standard operations needed on the User table
 *
 * @module User Operations for the user table in the Arcade Locator DB
 * @version 1.3
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected March 21, 2025
 */
import { postgres } from "../connectors/index.js";
import { VALID_USER_FIELDS } from "../constants/validation/index.js";

import { log4js } from "../../src/utils/log4js.js";
const logger = log4js.getLogger("[models|user]");

class User {
	// COUNT returns the total record count in the user table
	static async count() {
		const { rows } = await postgres.query("SELECT COUNT(*) FROM user");
		return parseInt(rows[0].count, 10);
	}

	// EXISTS verifies if the record id is in the user table
	static async exists(id) {
		const { rows } = await postgres.query(
			"SELECT 1 FROM user WHERE id = $1",
			[id],
		);
		return rows.length > 0;
	}

	// EXISTS verifies if the record id is in the user table
	static async validateNameAndYear(id) {
		const { rows } = await postgres.query(
			"SELECT 1 FROM user WHERE id = $1",
			[id],
		);
		return rows.length > 0;
	}

	// CREATE new user
	static async create(newUser) {
		if (!newUser?.name) {
			throw Object.assign(new Error("User 'email' is required"), {
				httpStatusCode: 400,
			});
		}

		const user = {
			name: newUser.name,
			year: newUser.year,
			link_imdb: newUser.link_imdb || null,
			link_letterboxd: newUser.link_letterboxd || null,
			link_justwatch: newUser.link_justwatch || null,
		};

		const { rows } = await postgres.query(
			"INSERT INTO user (name, year, link_imdb, link_letterboxd, link_justwatch) VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[
				user.name,
				user.year,
				user.link_imdb,
				user.link_letterboxd,
				user.link_justwatch,
			],
		);

		return rows[0];
	}

	// READ all users
	static async getAll(orderBy) {
		logger.trace("getAll:", orderBy);
		const { rows } = await postgres.query(
			`SELECT * FROM user ORDER BY ${orderBy}`,
		);
		return rows;
	}

	// READ user matching the id
	static async getById(id) {
		logger.trace("getById:", id);
		const { rows } = await postgres.query(
			`SELECT * FROM user WHERE id = $1`,
			[id],
		);

		// Validate that the user id exists
		if (!rows.length) {
			throw Object.assign(
				new Error(`User does not exist with id: ${id}`),
				{
					code: 400,
					httpStatusCode: 400,
				},
			);
		}

		return rows[0] || null;
	}

	// READ user matching the id
	static async getByApikeyId(apikeyId) {
		logger.trace("getByApikeyId:", apikeyId);
		const { rows } = await postgres.query(
			`SELECT * FROM users WHERE apikey_id = $1 AND is_suspended IS false`,
			[apikeyId],
		);

		// Validate that the apikey on a user exists
		if (!rows.length) {
			throw Object.assign(
				new Error(`User does not exist with the provided apikey!`),
				{ code: 400, httpStatusCode: 400 },
			);
		}

		return rows[0] || null;
	}

	// READ user matching the id
	static async getPermissionsById(id) {
		logger.trace("getPermissionsById:", id);
		const { rows } = await postgres.query(
			`SELECT p.permission_name
				FROM users u
				JOIN user_roles ur ON u.id = ur.user_id
				JOIN roles r ON ur.role_id = r.id
				JOIN role_permissions rp ON r.id = rp.role_id
				JOIN permissions p ON rp.permission_id = p.id
				WHERE u.id = $1
				ORDER BY p.permission_name ASC`,
			[id],
		);

		// Validate that the apikey on a user exists
		if (!rows.length) {
			throw Object.assign(
				new Error(`User does not exist with id: ${id}`),
				{
					code: 400,
					httpStatusCode: 400,
				},
			);
		}

		return rows.map((p) => p.permission_name) || null;
	}

	// READ user matching the id
	static async getRolesById(id) {
		logger.trace("getRolesById:", id);
		const { rows } = await postgres.query(
			`SELECT role_name
                                        FROM user_roles ur
                                        JOIN roles r ON ur.role_id = r.id
                                        WHERE ur.user_id = $1
                                        ORDER BY ur.role_id`,
			[id],
		);

		// Validate that the apikey on a user exists
		if (!rows.length) {
			throw Object.assign(
				new Error(`User does not have any roles with id: ${id}`),
				{ code: 400, httpStatusCode: 400 },
			);
		}

		return rows.map((role) => role.role_name) || null;
	}

	// UPDATE user by id with data
	// ChatGPT
	// https://chatgpt.com/c/67cf3b75-366c-8001-bf75-a51865b832f3
	static async update(id, data) {
		logger.trace("update:", id);

		// Validate data is passed in
		const keys = Object.keys(data);
		if (keys.length === 0) {
			throw Object.assign(new Error("No fields provided for update"), {
				code: 400,
				httpStatusCode: 400,
			});
		}

		// Validate the keys being passed in
		const invalidKeys = keys.filter(
			(key) => !VALID_USER_FIELDS.includes(key),
		);
		if (invalidKeys.length > 0) {
			console.log("Invalid keys:", invalidKeys);
			throw Object.assign(
				new Error(`Invalid fields provided: ${invalidKeys}`),
				{ code: 400, httpStatusCode: 400 },
			);
		}

		// Validate that the user id exists
		if (!(await this.exists(id))) {
			throw Object.assign(
				new Error(`User does not exist with id: ${id}`),
				{
					code: 400,
					httpStatusCode: 400,
				},
			);
		}

		// Generate dynamic SET clause: "column1 = $1, column2 = $2, ..."
		const setClause = keys
			.map((key, index) => `${key} = $${index + 1}`)
			.join(", ");

		// Values array (ensures correct binding)
		const values = [...Object.values(data), id];

		const query = `UPDATE user SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

		const { rows } = await postgres.query(query, values);
		return rows[0] || null;
	}

	// DELETE user by id
	static async delete(id) {
		logger.trace("delete:", id);
		if (!(await this.exists(id))) {
			throw Object.assign(
				new Error(`User does not exist with id: ${id}`),
				{
					code: 400,
					httpStatusCode: 400,
				},
			);
		}
		const { rows } = await postgres.query(
			"DELETE FROM user WHERE id = $1 RETURNING *",
			[id],
		);
		return rows[0] || null;
	}
}

export default User;
