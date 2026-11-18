import 'dotenv/config'
import express from 'express'
import { findMovie, listMovies } from './Model/movies.js';
import { pool } from './db.js';
import { findPerson, listPeople } from './Model/people.js';
import { errorHandler } from './Middleware/Errorhandler.js';
import { CreateError } from './Middleware/Errorhandler.js';
const app = express()



app.use(express.json());

app.get('/api/test', (req,res)=> {
    res.json({
        message: 'API is working!',
    });
});

app.get('/movies', async (req,res)=>{
    res.json(await listMovies(200, 0));
});

app.get('/movies/:tconst', async (req,res,next)=>{
    const movie = await findMovie(req.params.tconst);
    if (movie === undefined){
                return next(CreateError('Movie not found', 404));}
    res.json(movie);
});

app.get('/people', async (req,res)=>{
    res.json(await listPeople(200,0));
});

app.get('/people/:nconst', async (req,res,next)=>{
    const person = await findPerson(req.params.nconst);
    if (person===undefined){
                return next(CreateError('Movie not found', 404));}
    res.json(person);
});

app.use(errorHandler);

app.listen(Number(process.env.port ?? 3000), '0.0.0.0', ()=>{
    console.log(`API running on port ${3000}`);
});