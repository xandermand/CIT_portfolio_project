import 'dotenv/config'
import express from 'express'
import { findMovie, listMovies } from './Model/movies.js';
import { pool } from './db.js';
import { findPerson, listPeople } from './Model/people.js';
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

app.get('/movies/:tconst', async (req,res)=>{
    const movie = await findMovie(req.params.tconst);
    if (movie === undefined){
        return res.status(404).json({ error: 'No such movie'});
    }
    res.json(movie);
});

app.get('/people', async (req,res)=>{
    res.json(await listPeople(200,0));
});

app.get('/people/:nconst', async (req,res)=>{
    const person = await findPerson(req.params.nconst);
    if (person===undefined){
        return res.status(404).json({error: 'No such person'})
    }
    res.json(person);
});


app.listen(Number(process.env.port ?? 3000), '0.0.0.0', ()=>{
    console.log(`API running on port ${3000}`);
});