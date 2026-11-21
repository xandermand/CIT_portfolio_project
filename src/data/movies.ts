import {pool} from '../db.js'

export interface Movie {
    tconst: string; title: string;
    titleType: string; released: string;
    poster: string;
}

export interface MovieDbo {
    tconst: string, title: string
}

export async function findMovie(
    tconst:string): Promise<Movie|undefined>{
        const {rows} = await pool.query<Movie>(
            `SELECT tconst, primarytitle AS "title", titletype AS "titleType", 
                    released, poster
            FROM title_basic WHERE tconst = $1`, [tconst]);
        return rows[0];
    }

export async function listMovies(
    limit: number, offset: number): Promise<Movie[]> {
        const {rows } = await pool.query<Movie>(
            `${SELECT_MOVIE} ORDER BY tconst limit $1 OFFSET $2`,
            [limit, offset]);
            return rows
    }

const SELECT_MOVIE = `
    SELECT tconst, primarytitle AS "title", titletype AS "titleType", released, poster
        FROM title_basic`;

