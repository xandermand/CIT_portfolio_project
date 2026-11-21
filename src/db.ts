import {Pool} from 'pg';
import "dotenv/config"

export const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: Number(process.env.PGPORT),
    ssl: {rejectUnauthorized: false},
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err);
});