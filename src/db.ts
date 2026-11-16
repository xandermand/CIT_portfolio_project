import {Pool} from 'pg';

export const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    database: process.env.PGNAME,
    ssl: {rejectUnauthorized: false},
});