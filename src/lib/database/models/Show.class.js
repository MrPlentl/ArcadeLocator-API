/**
 * Contains all the standard operations needed on the Shows table
 *
 * @module Shows Operations for the show table in the Arcade Locator DB
 * @version 1.2
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected March 24, 2025
 */
import pool from "../connectors/postgres.js";
import { VALID_SHOW_FIELDS } from "../constants/validation/index.js";

import { log4js } from "../../../utils/log4js.js";
const logger = log4js.getLogger("[models|show]");

class Show {
	// COUNT returns the total record count in the show table
	static async count() {
		const { rows } = await pool.query("SELECT COUNT(*) FROM show");
		return parseInt(rows[0].count, 10);
	}

	// EXISTS verifies if the record id is in the show table
	static async exists(id) {
		const { rows } = await pool.query("SELECT 1 FROM show WHERE id = $1", [
			id,
		]);
		return rows.length > 0;
	}

	// EXISTS verifies if the record id is in the show table
	static async validateNameAndYear(id) {
		const { rows } = await pool.query("SELECT 1 FROM show WHERE id = $1", [
			id,
		]);
		return rows.length > 0;
	}

	// CREATE new show
	static async create(newShow) {
		if (!newShow?.name) {
			throw Object.assign(new Error("Show 'name' is required"), {
				httpStatusCode: 400,
			});
		}

		if (!newShow?.year) {
			throw Object.assign(new Error("Show 'year' is required"), {
				httpStatusCode: 400,
			});
		}

		const show = {
			name: newShow.name,
			year: newShow.year,
			link_imdb: newShow.link_imdb || null,
			link_justwatch: newShow.link_justwatch || null,
		};

		const { rows } = await pool.query(
			"INSERT INTO show (name, year, link_imdb, link_justwatch) VALUES ($1, $2, $3, $4) RETURNING *",
			[show.name, show.year, show.link_imdb, show.link_justwatch],
		);

		return rows[0];
	}

	// READ all shows
	static async getAll(orderBy) {
		logger.trace("getAll:", orderBy);
		const { rows } = await pool.query(
			`SELECT * FROM show ORDER BY ${orderBy}`,
		);
		return rows;
	}

	// READ Shows matching the id
	static async getById(id) {
		logger.trace("getById:", id);
		const { rows } = await pool.query(`SELECT * FROM show WHERE id = $1`, [
			id,
		]);

		// Validate that the show id exists
		if (!rows.length) {
			throw Object.assign(
				new Error(`Shows does not exist with id: ${id}`),
				{
					code: 400,
					httpStatusCode: 400,
				},
			);
		}

		return rows[0] || null;
	}

	// UPDATE show by id with data
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
			(key) => !VALID_SHOW_FIELDS.includes(key),
		);
		if (invalidKeys.length > 0) {
			console.log("Invalid keys:", invalidKeys);
			throw Object.assign(
				new Error(`Invalid fields provided: ${invalidKeys}`),
				{ code: 400, httpStatusCode: 400 },
			);
		}

		// Validate that the show id exists
		if (!(await this.exists(id))) {
			throw Object.assign(
				new Error(`Shows does not exist with id: ${id}`),
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

		const query = `UPDATE show SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

		const { rows } = await pool.query(query, values);
		return rows[0] || null;
	}

	// DELETE show by id
	static async delete(id) {
		logger.trace("delete:", id);
		if (!(await this.exists(id))) {
			throw Object.assign(
				new Error(`Shows does not exist with id: ${id}`),
				{
					code: 400,
					httpStatusCode: 400,
				},
			);
		}
		const { rows } = await pool.query(
			"DELETE FROM show WHERE id = $1 RETURNING *",
			[id],
		);
		return rows[0] || null;
	}
}

export default Show;
