import { generateSalt, hashPassword} from "../Controller/passwordmanager.js";
import { pool } from "../db.js";

export interface User{
    user_id: string, username: string, email: string, password: string
}

export async function listUsers(
    limit:number, offset:number): Promise<User[]>{
        const {rows} = await pool.query<User>(
            `SELECT user_id, username, email
            FROM users_basics
            LIMIT $1 OFFSET $2`, [limit,offset]
        );
        return rows
    }

export async function findUser(user_id:string): Promise<User|undefined>{
    const {rows} = await pool.query(
        `SELECT user_id, username, email
        FROM users_basics
        WHERE user_id = $1`, [user_id]);
        return rows[0]
}

export async function createUser(u:User): Promise<string|undefined>{
    const salt = generateSalt();
    const hashedpassword = await hashPassword(salt, u.password);
    const client = await pool.connect();
    let id;
    try {
        await client.query('BEGIN');
        id = await client.query(
        `INSERT INTO users_basics ("username", "email", "password", "salt")
        VALUES ($1, $2, $3, $4) RETURNING user_id`, [u.username, u.email, hashedpassword, salt]);
        await client.query('COMMIT');
        return id.rows[0].user_id;
    } catch (err) {
        await client.query('ROLLBACK'); throw err;
    } finally {client.release()}
}

