import env from "../../../utils/environment.js";
import { exampleMiddleware, authenticateToken, setStdRespHeaders } from "../middleware/index.js";
import pkg from 'pg';
const { Pool } = pkg;

const getShows = async (req, res) => { 
    console.log("Getting Shows");
    const pool = new Pool({
        user: env.DB_USERNAME,
        host: env.DB_HOSTNAME,
        database: env.DB_NAME,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
      });
    
    async function queryDatabase() {
      try {
        const results = await pool.query('SELECT * FROM show');
        console.log(results.rows);
        return results;
      } catch (err) {
        console.error(err);
      }
    }
    
    const test = await queryDatabase();

    // return res.status(200).json(test.rows); 
    return res.status(200).send(JSON.stringify(test.rows)); 
}

export default {
    getShows: [
        exampleMiddleware,
        setStdRespHeaders,
        authenticateToken,
        getShows
    ]
};