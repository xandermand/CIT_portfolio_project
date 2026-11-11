import {pool} from '../db.js'

export interface Movie {
    tconst: string; title: string;
    titleType: string; released: string;
    poster: string;
}

export async function findMovie(
    tconst:string): Promise<Movie|undefined>{
        const {rows} = await pool.query<Movie>(
            `SELECT tconst, primarytitle AS "title", titletype AS "titleType", 
                    released, poster
            FROM title_basic WHERE tconst = $1`, [tconst]);
        return rows[0];
    }

