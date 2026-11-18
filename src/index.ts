import 'dotenv/config'
import express from 'express'
import { findMovie, listMovies } from './Model/movies.js';
import { pool } from './db.js';
import { findPerson, listPeople } from './Model/people.js';
import { createUser, findUser, listUsers } from './Model/users.js';
import { validateNewUser } from './validator.js';
import { error } from 'node:console';
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

app.get('/users', async (req,res)=>{
    res.json(await listUsers(200,0));
});

app.post('/users/register', async (req,res, next)=>{
    try{const input = validateNewUser(req.body);
    if (input === undefined){
        res.status(400).json({error: 'Email, Password or Username is not allowed'})
        return;
    }
    const created = await createUser(input);
    res.status(201).location(`/users/${created}`).json(created)
} catch (err){
    next(err)
}})

app.get('/users/:user_id', async (req,res)=>{
    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return res.status(404).json({error: 'No such user'})
    }
    res.json(user);
})



app.listen(Number(process.env.port ?? 3000), '0.0.0.0', ()=>{
    console.log(`API running on port ${3000}`);
});