import { postgres } from "../connectors/index.js";
class Apikey {
	// CREATE
	/**
	 *
	 * @param {*} newApiKey
	 * @returns
	 */
	static async create(newApiKey) {
		if (!newApiKey?.lookup_hash) {
			throw "Api 'lookup_hash' is required";
		}

		if (!newApiKey?.hashed_key) {
			throw "Api 'hashed_key' is required";
		}

		const { rows } = await postgres.query(
			"INSERT INTO apikey (lookup_hash, hashed_key) VALUES ($1, $2) RETURNING *",
			[newApiKey.lookup_hash, newApiKey.hashed_key],
		);

		return rows[0];
	}

	// READ
	// Returns all records
	//   static async getAll(orderBy) {
	//     logger.trace("getAll:", orderBy);
	//     try {
	//       const { rows } = await postgres.query(`SELECT * FROM movie ORDER BY ${orderBy}`);
	//       return rows;
	//     } catch (error) {
	//       logger.error("SQL Error in getAll:", error);
	//       throw {status: "Error", message: `An error occured while fetching movies. Please try again later and contact Support if the problem presists.`};
	//     }
	//   }

	// Returns Apikey matching the id
	static async getById(id) {
		const { rows } = await postgres.query(
			`SELECT * FROM apikey WHERE id = $1`,
			[id],
		);

		return rows[0] || null; // Returns null if no records are found
	}
	// Returns Movie matching the id
	static async getByLookupHash(lookupHash) {
		const { rows } = await postgres.query(
			`SELECT id, hashed_key, expires_at FROM apikey WHERE lookup_hash = $1`,
			[lookupHash],
		);

		return rows[0] || null; // Returns null if no records are found
	}

	// @TODO: Need to review
	//   static async count() {
	//     const { rows } = await postgres.query("SELECT COUNT(*) FROM movie");
	//     return parseInt(rows[0].count, 10);
	//   }

	//   // @TODO: Need to review
	//   static async exists(id) {
	//     const { rows } = await postgres.query("SELECT 1 FROM movie WHERE id = $1", [id]);
	//     return rows.length > 0;
	//   }

	// UPDATE
	// ChatGPT
	// https://chatgpt.com/c/67cf3b75-366c-8001-bf75-a51865b832f3
	//   static async update(id, data) {
	//     logger.trace("update:", id);
	//     try {
	//       const keys = Object.keys(data);
	//       if (keys.length === 0) {
	//         throw new Error("No fields provided for update");
	//       }

	//       // Generate dynamic SET clause: "column1 = $1, column2 = $2, ..."
	//       const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");

	//       // Values array (ensures correct binding)
	//       const values = [...Object.values(data), id];

	//       const query = `UPDATE movie SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

	//       const { rows } = await postgres.query(query, values);
	//       return rows[0] || null;
	//     } catch (error) {
	//       console.error("Error updating movie:", error);
	//       throw error;
	//     }
	//   }

	// DELETE
	//   static async delete(id) {
	//     logger.trace("delete:", id);
	//     try {
	//       const { rows } = await postgres.query("DELETE FROM movie WHERE id = $1 RETURNING *", [id]);
	//       return rows[0] || null;
	//     } catch (error) {
	//       console.error("Error Deleting movie:", error);
	//       throw error;
	//     }
	//   }
}

export default Apikey;
