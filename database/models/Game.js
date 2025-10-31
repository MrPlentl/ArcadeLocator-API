/**
 * Contains all the standard operations needed on the Game table
 *
 * @module Game Operations for the game table in the Arcade Locator DB
 * @version 1.1
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected TBD
 */
import { postgres } from "../connectors/index.js";
import { VALID_GAME_FIELDS } from "../constants/validation/index.js";
import Igdb from "./Igdb.js";

class Game {
	// COUNT returns the total record count in the game table
	static async count() {
		const { rows } = await postgres.query("SELECT COUNT(*) FROM game");
		return parseInt(rows[0].count, 10);
	}

	// EXISTS verifies if the record id is in the game table
	static async exists(id) {
		const { rows } = await postgres.query(
			"SELECT 1 FROM game WHERE id = $1",
			[id],
		);
		return rows.length > 0;
	}

	// EXISTS verifies if the record id is in the game table
	static async validateNameAndYear(id) {
		const { rows } = await postgres.query(
			"SELECT 1 FROM game WHERE id = $1",
			[id],
		);
		return rows.length > 0;
	}

	// CREATE new game
	static async create(newGame) {
		if (!newGame?.title) {
			throw Object.assign(new Error("game 'title' is required"), {
				httpStatusCode: 400,
			});
		}

		if (!newGame?.type) {
			throw Object.assign(new Error("game 'type' is required"), {
				httpStatusCode: 400,
			});
		}

		const game = {
			title: newGame.title,
			type: newGame.type,
			igdb_id: newGame.igdb_id || null,
			igdb_slug: newGame.igdb_slug || null,
			updated_by: newGame.updated_by || null,
			created_by: newGame.created_by || null,
		};

		const { rows } = await postgres.query(
			"INSERT INTO game (title, type, igdb_id, igdb_slug, updated_by, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
			[
				game.title,
				game.type,
				game.igdb_id,
				game.igdb_slug,
				game.updated_by,
				game.created_by,
			],
		);

		return rows[0];
	}

	// READ all games missing an Igdb id
	static async getAllGamesMissingIgdbId() {
		const { rows } = await postgres.query(
			`SELECT * FROM game WHERE type > 1 AND type < 8 AND igdb_id IS NULL`,
		);
		return rows;
	}

	// READ all games
	static async getAll(orderBy = "id") {
		const { rows } = await postgres.query(
			`SELECT * FROM game ORDER BY ${orderBy}`,
		);
		return rows;
	}

	// READ Game matching the id
	static async getById(id) {
		const { rows } = await postgres.query(
			`SELECT * FROM game WHERE id = $1`,
			[id],
		);

		// Validate that the game id exists
		if (!rows.length) {
			throw Object.assign(
				new Error(`Game does not exist with id: ${id}`),
				{
					code: 400,
					httpStatusCode: 400,
				},
			);
		}

		return rows[0] || null;
	}

	// UPDATE game by id with data
	// ChatGPT
	// https://chatgpt.com/c/67cf3b75-366c-8001-bf75-a51865b832f3
	static async update(id, data) {
		if (data.igdb_id && !(await Igdb.exists(data.igdb_id))) {
			const newIgdb = {
				id: data.igdb_id,
				title: data.title,
			};
		}

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
			(key) => !VALID_GAME_FIELDS.includes(key),
		);
		if (invalidKeys.length > 0) {
			throw Object.assign(
				new Error(`Invalid fields provided: ${invalidKeys}`),
				{ code: 400, httpStatusCode: 400 },
			);
		}

		// Validate that the game id exists
		if (!(await this.exists(id))) {
			throw Object.assign(
				new Error(`Game does not exist with id: ${id}`),
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

		const query = `UPDATE game SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

		const { rows } = await postgres.query(query, values);
		return rows[0] || null;
	}

	// DELETE game by id
	static async delete(id) {
		if (!(await this.exists(id))) {
			throw Object.assign(
				new Error(`Game does not exist with id: ${id}`),
				{
					code: 400,
					httpStatusCode: 400,
				},
			);
		}
		const { rows } = await postgres.query(
			"DELETE FROM game WHERE id = $1 RETURNING *",
			[id],
		);
		return rows[0] || null;
	}
}

export default Game;
