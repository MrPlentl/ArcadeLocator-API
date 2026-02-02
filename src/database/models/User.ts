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

// 1. Interface for the Database Row
export interface IUser {
  id: number;
  display_name: string;
  uuid?: string;
  year?: number;
  link_imdb?: string;
  link_letterboxd?: string;
  link_justwatch?: string;
  apikey_id?: number;
  is_suspended?: boolean;
  // Add created_at/updated_at if your DB has them
}

// 2. Interface for Creating a User
export interface INewUser {
  display_name: string;
  year?: number;
  link_imdb?: string;
  link_letterboxd?: string;
  link_justwatch?: string;
}

// 3. Interface for Custom Errors (replaces Object.assign logic)
interface HttpError extends Error {
  code?: number | string;
  httpStatusCode?: number;
}

class User {
  // COUNT returns the total record count in the user table
  static async count(): Promise<number> {
    const { rows } = await postgres.query<{ count: string }>("SELECT COUNT(*) FROM user");
    return parseInt(rows[0].count, 10);
  }

  // EXISTS verifies if the record id is in the user table
  static async exists(id: number | string): Promise<boolean> {
    const { rows } = await postgres.query(
      "SELECT 1 FROM user WHERE id = $1",
      [id]
    );
    return rows.length > 0;
  }

  /**
   * @TODO Usage seems identical to 'exists'. Logic name suggests validation but query checks ID.
   */
  static async validateNameAndYear(id: number | string): Promise<boolean> {
    const { rows } = await postgres.query(
      "SELECT 1 FROM user WHERE id = $1",
      [id]
    );
    return rows.length > 0;
  }

  // CREATE new user
  static async create(newUser: INewUser): Promise<IUser> {
    if (!newUser?.display_name) {
      const error = new Error("User 'display_name' is required") as HttpError;
      error.httpStatusCode = 400;
      throw error;
    }

    // Prepare clean object
    const user = {
      display_name: newUser.display_name,
      year: newUser.year || null,
      link_imdb: newUser.link_imdb || null,
      link_letterboxd: newUser.link_letterboxd || null,
      link_justwatch: newUser.link_justwatch || null,
    };

    const { rows } = await postgres.query<IUser>(
      "INSERT INTO user (name, year, link_imdb, link_letterboxd, link_justwatch) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        user.display_name,
        user.year,
        user.link_imdb,
        user.link_letterboxd,
        user.link_justwatch,
      ]
    );

    return rows[0];
  }

  // READ all users
  static async getAll(orderBy: string): Promise<IUser[]> {
    // SECURITY WARNING: Ensure 'orderBy' is validated before passing to SQL string to prevent injection
    const { rows } = await postgres.query<IUser>(
      `SELECT * FROM user ORDER BY ${orderBy}`
    );
    return rows;
  }

  // READ user matching the id
  static async getById(id: number | string): Promise<IUser | null> {
    const { rows } = await postgres.query<IUser>(
      `SELECT * FROM user WHERE id = $1`,
      [id]
    );

    // Validate that the user id exists
    if (!rows.length) {
      const error = new Error(`User does not exist with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    return rows[0] || null;
  }

  // READ user matching the apikey
  static async getByApikeyId(apikeyId: number | string): Promise<IUser | null> {
    // Note: Query uses 'users' (plural), others use 'user' (singular). Check DB schema.
    const { rows } = await postgres.query<IUser>(
      `SELECT * FROM users WHERE apikey_id = $1 AND is_suspended IS false`,
      [apikeyId]
    );

    if (!rows.length) {
      const error = new Error(`User does not exist with the provided apikey!`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    return rows[0] || null;
  }

  // READ permissions
  static async getPermissionsById(id: number | string): Promise<string[]> {
    const { rows } = await postgres.query<{ permission_name: string }>(
      `SELECT p.permission_name
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = $1
        ORDER BY p.permission_name ASC`,
      [id]
    );

    if (!rows.length) {
       // Logic note: A user might exist but have no permissions. 
       // Throwing 400 here implies every user MUST have permissions.
      const error = new Error(`User does not exist with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    return rows.map((p) => p.permission_name);
  }

  // READ roles
  static async getRolesById(id: number | string): Promise<string[]> {
    const { rows } = await postgres.query<{ role_name: string }>(
      `SELECT role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1
        ORDER BY ur.role_id`,
      [id]
    );

    if (!rows.length) {
      const error = new Error(`User does not have any roles with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    return rows.map((role) => role.role_name);
  }

  // UPDATE user by id with data
  static async update(id: number | string, data: Partial<IUser>): Promise<IUser | null> {
    const keys = Object.keys(data);
    
    if (keys.length === 0) {
      const error = new Error("No fields provided for update") as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    // Validate the keys being passed in
    const invalidKeys = keys.filter(
      (key) => !VALID_USER_FIELDS.includes(key)
    );

    if (invalidKeys.length > 0) {
      console.log("Invalid keys:", invalidKeys);
      const error = new Error(`Invalid fields provided: ${invalidKeys}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    // Validate that the user id exists
    if (!(await this.exists(id))) {
      const error = new Error(`User does not exist with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    // Generate dynamic SET clause
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    // Values array (ensures correct binding)
    const values = [...Object.values(data), id];

    // Ensure table name 'user' matches your schema
    const query = `UPDATE user SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    const { rows } = await postgres.query<IUser>(query, values);
    return rows[0] || null;
  }

  // DELETE user by id
  static async delete(id: number | string): Promise<IUser | null> {
    if (!(await this.exists(id))) {
      const error = new Error(`User does not exist with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }
    
    const { rows } = await postgres.query<IUser>(
      "DELETE FROM user WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0] || null;
  }
}

export default User;
