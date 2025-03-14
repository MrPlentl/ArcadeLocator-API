// CRUD Methods
// These methods perform fundamental operations on the database.

// Create:
// create(data) → Inserts a new record into the database.

// Update:
// update(id, data) → Updates an existing record.

// Delete:
// delete(id) → Removes a record from the database.

// Read
// getAll() → Retrieves all records.
// getById(id) → Fetches a single record by its primary key.

// -----------------------
// findOne(condition) → Fetches a single record based on a condition.
// findAll(condition) → Retrieves multiple records based on a condition.

// Filtering & Searching:
// findByName(name) → Retrieves records that match a given name.
// findByYear(year) → Retrieves movies from a specific year.
// search(query) → Performs a search on multiple fields.
// Aggregation & Counting:

// count() → Returns the total number of records.
// countByCondition(condition) → Counts records matching a condition.
// Sorting & Pagination:

// getSorted(column, order = 'ASC') → Fetches records sorted by a column.
// paginate(limit, offset) → Retrieves a paginated subset of records.
// Existence Checks:

// exists(id) → Returns true if a record exists.
// findOrCreate(data) → Retrieves a record if it exists or creates it if not.

import { log4js } from "../../../utils/log4js.js";
const logger = log4js.getLogger("[models|movie]"); // Sets up the logger with the [app] string prefix

// @TODO: Update this connection file location 
import pool from "../db.js";

class Movie {
  // CREATE
  static async create(newMovie) {
    try {
        if (!newMovie?.name) {
            throw ("Movie 'name' is required");
        }

        if (!newMovie?.year) {
            throw ("Movie 'year' is required");
        };

        const movie = {
            name: newMovie.name,
            year: newMovie.year,
            link_imdb: newMovie.link_imdb || null,
            link_letterboxd: newMovie.link_letterboxd || null,
            link_justwatch: newMovie.link_justwatch || null
        };
        const { rows } = await pool.query(
            "INSERT INTO movie (name, year, link_imdb, link_letterboxd, link_justwatch) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [movie.name, movie.year, movie.link_imdb, movie.link_letterboxd, movie.link_justwatch]
        );
        return rows[0];
      } catch (error) {
        logger.error("SQL Error in create:", error);
        throw {status: "Error", message: `${error}. Please try again later and contact Support if the problem presists.`};
      }
  }

  // READ
  // Returns all records
  static async getAll(orderBy) {
    logger.trace("getAll:", orderBy);
    try {
      const { rows } = await pool.query(`SELECT * FROM movie ORDER BY ${orderBy}`);
      return rows;
    } catch (error) {
      logger.error("SQL Error in getAll:", error);
      throw {status: "Error", message: `An error occured while fetching movies. Please try again later and contact Support if the problem presists.`};
    }
  }
  
  // Returns Movie matching the id
  static async getById(id) {
    logger.trace("getById:", id);
    try {
      const { rows } = await pool.query(`SELECT * FROM movie WHERE id = $1`, [id]);
      return rows[0] || null; // Returns null if no records are found
    } catch (error) {
      logger.error("SQL Error in getById:", error);
      throw {status: "Error", message: `An error occured while fetching the movie with id: ${id}. Please try again later and contact Support if the problem presists.`};
    }
  }

  // @TODO: Need to review
  static async count() {
    const { rows } = await pool.query("SELECT COUNT(*) FROM movie");
    return parseInt(rows[0].count, 10);
  }

  // @TODO: Need to review
  static async exists(id) {
    const { rows } = await pool.query("SELECT 1 FROM movie WHERE id = $1", [id]);
    return rows.length > 0;
  }

  // UPDATE
  // ChatGPT
  // https://chatgpt.com/c/67cf3b75-366c-8001-bf75-a51865b832f3
  static async update(id, data) {
    logger.trace("update:", id);
    try {
      const keys = Object.keys(data);
      if (keys.length === 0) {
        throw new Error("No fields provided for update");
      }

      // Generate dynamic SET clause: "column1 = $1, column2 = $2, ..."
      const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
      
      // Values array (ensures correct binding)
      const values = [...Object.values(data), id];

      const query = `UPDATE movie SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
      
      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
  }

  // DELETE
  static async delete(id) {
    logger.trace("delete:", id);
    try {
      const { rows } = await pool.query("DELETE FROM movie WHERE id = $1 RETURNING *", [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error Deleting movie:", error);
      throw error;
    }
  }
}

export default Movie;
