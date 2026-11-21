import { pool } from "../db.js"


export interface Person{
    nconst: string, name: string,
    birthyear: number, deathyear: number, rating: number
}

export async function listPeople(
    limit:number, offset:number):Promise<Person[]>{
        const {rows} = await pool.query<Person>(
            `SELECT name_basic.nconst, primaryname AS "name",
            birthyear, deathyear, rating
            FROM name_basic
            ORDER BY nconst LIMIT $1 OFFSET $2`,
            [limit, offset]);
            return rows
    }

export async function findPerson(
    nconst:string):Promise<Person|undefined>{
        const {rows} =await pool.query<Person>(
            `SELECT nconst, primaryname AS "name", birthyear, deathyear, rating
            FROM name_basic
            WHERE nconst = $1`, [nconst]);
            return rows[0]
    }