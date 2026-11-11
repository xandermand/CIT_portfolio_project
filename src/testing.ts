import { Pool } from "pg";
import 'dotenv/config';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {rejectUnauthorized: false},
});

async function testConnection() {
    try {
        const result = await pool.query(
            "SELECT NOW() AS server_time"
        );

        console.log("Database conncection sucessfull!");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("Database connection failed: ", error);
    } finally {
        await pool.end();
    }
};

testConnection();