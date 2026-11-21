import { generateSalt, hashPassword} from "../services/passwordmanager.js";
import { pool } from "../db.js";
import { Movie, MovieDbo } from "./movies.js";

export interface User{
    user_id: string, username: string, email: string, password: string
}

export interface Review{
    user_id: string, tconst: string, score: string
}

export interface Search{
    user_id: string, search: string, search_id:string
}

interface logUser{
        user_id: string, username: string, email: string, password: string,salt: string
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

export async function findUserPassword(email: string): Promise<logUser | undefined> {
    const { rows } = await pool.query<logUser>(
        `SELECT user_id, username, email, password, salt FROM users_basics WHERE email = $1`, [email]
    );

    return rows[0];
}



export async function createUserMovieBookmark(user_id:string,tconst:string): Promise<string|undefined>{
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO user_title_bookmarks ("user_id", "tconst")
            VALUES ($1, $2)`, [user_id, tconst]
        );
        await client.query('COMMIT');
        return tconst
    } catch (err) {
        await client.query('ROLLBACK'); throw err; 
    } finally {client.release()}
}

export async function findUserBookmarks(user_id:string): Promise<Movie[]>{
    const {rows} = await pool.query(
        `SELECT user_title_bookmarks.tconst, primarytitle AS "title", titletype AS "titleType", 
        released, poster
        FROM user_title_bookmarks, title_basic
        WHERE user_title_bookmarks.tconst = title_basic.tconst AND user_title_bookmarks.user_id = $1
        ORDER BY bookmark_time`, [user_id]);
        return rows;
}

export async function deleteUserMovieBookmark(user_id:string,tconst:string): Promise<string|undefined>{
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `DELETE FROM user_title_bookmarks
            WHERE user_id=$1 AND tconst=$2`,[user_id,tconst]);
        await client.query('COMMIT');
        return tconst;
    } catch (err) {
        await client.query('ROLLBACK'); throw err;
    } finally {client.release()}
}

export async function createUserPersonBookmark(user_id:string,nconst:string): Promise<string|undefined>{
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO user_name_bookmarks ("user_id", "nconst")
            VALUES ($1, $2)`, [user_id, nconst]
        );
        await client.query('COMMIT');
        return nconst
    } catch (err) {
        await client.query('ROLLBACK'); throw err; 
    } finally {client.release()}
}

export async function findUserPersonBookmarks(user_id:string): Promise<Movie[]>{
    const {rows} = await pool.query(
        `SELECT user_name_bookmarks.nconst, primaryname AS "name", birthyear, 
        deathyear, rating
        FROM user_name_bookmarks, name_basic
        WHERE user_name_bookmarks.nconst = name_basic.nconst AND user_name_bookmarks.user_id = $1
        ORDER BY bookmark_time`, [user_id]);
        return rows;
}

export async function deleteUserPersonBookmark(user_id:string,nconst:string): Promise<string|undefined>{
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `DELETE FROM user_name_bookmarks
            WHERE user_id=$1 AND nconst=$2`,[user_id,nconst]);
        await client.query('COMMIT');
        return nconst;
    } catch (err) {
        await client.query('ROLLBACK'); throw err;
    } finally {client.release()}
}

export async function createUserReview(user_id:string,tconst:string,score:number): Promise<string|undefined>{
    if (score>10||score<1){
        return undefined;
    }
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO user_ratings ("user_id", "tconst", "rating")
            VALUES ($1, $2, $3)`, [user_id, tconst, score]);
        await client.query('COMMIT');
        return tconst;
    } catch (err) {
        await client.query('ROLLBACK'); throw err;
    } finally {client.release()}
}

export async function findUserReviews(user_id:string): Promise<Review[]> {
    const {rows} = await pool.query(`
        SELECT user_id, tconst, rating
        FROM user_ratings
        WHERE user_id = $1
        ORDER BY rating_time`,[user_id]);
        return rows;
}

export async function deleteUserReview(user_id:string,tconst:string): Promise<string|undefined> {
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        await client.query(
            `DELETE FROM user_ratings
            WHERE user_id=$1 AND tconst=$2`,[user_id,tconst]);
        await client.query('COMMIT');
        return tconst;
    } catch (err) {
        await client.query('ROLLBACK'); throw err;
    } finally {client.release()}
}

export async function updateUserReview(user_id:string, tconst:string,score:number): Promise<string|undefined> {
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        await client.query(`
            UPDATE user_ratings
            SET rating = $1
            WHERE user_id = $2 AND tconst = $3`, [score,user_id,tconst]);
        await client.query('COMMIT');
        return tconst;
    } catch (err){
        await client.query('ROLLBACK'); throw err;
    } finally {client.release()}
}

export async function createUserSearch(user_id:string,search:string): Promise<MovieDbo[]>{
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        const {rows} = await client.query(
            `SELECT id, title
            FROM weighted_search($1)`,[search.split(" ")]);
        await client.query(`
            INSERT INTO search_history ("user_id","search_text")
            VALUES ($1,$2)`,[user_id,search]);
        await client.query('COMMIT');
        return rows;
    } catch (err){
        await client.query('ROLLBACK'); throw err;
    } finally {client.release()}
}

export async function listUserSearches(user_id:string): Promise<Search[]>{
    const {rows} = await pool.query(`
        SELECT user_id, search_text, search_id
        FROM search_history
        WHERE user_id = $1`,[user_id]);
        return rows;
}