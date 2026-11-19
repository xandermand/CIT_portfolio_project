import 'dotenv/config'
import express from 'express'
import { findMovie, listMovies } from './Model/movies.js';
import { pool } from './db.js';
import { findPerson, listPeople } from './Model/people.js';

import { createUser, createUserMovieBookmark, findUser, findUserBookmarks, listUsers } from './Model/users.js';
import { validateNewUser } from './validator.js';
import {errorHandler} from './Middleware/Errorhandler.js';
import {CreateError} from './Middleware/Errorhandler.js';
import cors from 'cors';
const app = express()

//5173 is example i dont know what the host for frontend is yet.
// We can change it later if its wrong when we have a front end
app.use(cors({origin: 'http://localhost:5173' }));

app.use(express.json());

app.get('/api/test', (req,res)=> {
    res.json({
        message: 'API is working!',
    });
});

app.get('/movies', async (req,res)=>{
    res.json(await listMovies(200, 0));
});

app.get('/movies/:tconst', async (req,res, next)=>{
    const movie = await findMovie(req.params.tconst);
    if (movie === undefined){
        return next(CreateError('Movie not found', 404));
    }
    res.json(movie);
});

app.get('/people', async (req,res)=>{
    res.json(await listPeople(200,0));
});

app.get('/people/:nconst', async (req,res, next)=>{
    const person = await findPerson(req.params.nconst);
    if (person===undefined){
        return next(CreateError('Person not found', 404));
    }
    res.json(person);
});

app.get('/users', async (req,res)=>{
    res.json(await listUsers(200,0));
});

app.post('/users/register', async (req,res, next)=>{
    try{const input = validateNewUser(req.body);
    if (input === undefined){
        return next(CreateError('Email, Password or Username is not allowed', 400));
    }
    const created = await createUser(input);
    res.status(201).location(`/users/${created}`).json(created);
} catch (err){
    next(err);
}})

app.get('/users/:user_id', async (req,res,next)=>{
    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    res.json(user);
})

app.post('/users/:user_id/bookmark', async (req,res,next)=>{
    try{const bookmark = await createUserMovieBookmark(req.params.user_id,req.body.tconst);
    if (typeof(bookmark)!=="string"){
        return next(CreateError('User or Movie not allowed', 400));
    }
    res.status(201).location(`/users/${req.params.user_id}/bookmarks/${bookmark}`).json(bookmark);
    } catch (err){
        next(err);
    }
})

app.get('/users/:user_id/bookmarks', async (req,res,next)=>{
    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    const user_bookmark = await findUserBookmarks(req.params.user_id);
    res.json(user_bookmark);
})

app.delete('/users/:user_id/bookmarks/:tconst', async (req,res,next)=>{
    
})

app.use(errorHandler);


app.listen(Number(process.env.port ?? 3000), '0.0.0.0', ()=>{
    console.log(`API running on port ${3000}`);
});

