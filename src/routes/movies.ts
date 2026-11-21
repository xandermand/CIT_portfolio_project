import { Router } from "express";
import * as movies from '../data/movies.js';
import { CreateError } from "../Middleware/Errorhandler.js";


export const moviesRouter = Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function pageOf(query: Record<string, unknown>): { limit: number; offset: number} {
    const asked = Number(query.limit ?? DEFAULT_LIMIT);
    const limit = Number.isFinite(asked) && asked > 0 ? Math.min(asked, MAX_LIMIT) : DEFAULT_LIMIT;
    const from = Number(query.offset ?? 0);
    const offset = Number.isFinite(from) && from >= 0 ? from : 0;
    return { limit, offset};
}



moviesRouter.get('/', async (req,res,next)=>{
    try{
        const {limit,offset} = pageOf(req.query as Record<string,unknown>);
        res.json(await movies.listMovies(limit, offset));
    } catch (err){
        next(err);
    }
});

moviesRouter.get('/:tconst', async (req,res,next)=>{
    try{
        const movie = await movies.findMovie(req.params.tconst);
        if (movie === undefined){
            return next(CreateError('Movie not found', 404));
        }
    res.json(movie);
} catch (err){
    next(err);
}
});