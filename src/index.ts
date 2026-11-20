import 'dotenv/config'
import express from 'express'
import { findMovie, listMovies } from './Model/movies.js';
import { pool } from './db.js';
import { findPerson, listPeople } from './Model/people.js';
<<<<<<< Updated upstream
import { errorHandler } from './Middleware/Errorhandler.js';
import { CreateError } from './Middleware/Errorhandler.js';
=======

import jwt from 'jsonwebtoken';
import { verify } from './Controller/passwordmanager.js';
import { createUser, findUser, listUsers,findUserPassword } from './Model/users.js';
import { validateNewUser } from './validator.js';
import {errorHandler} from './Middleware/Errorhandler.js';
import {CreateError} from './Middleware/Errorhandler.js';
import {authenticator} from './Middleware/Authenticator.js';
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
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

app.post('/users/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await findUserPassword(email);
        if (user === undefined) {
            return next(CreateError('Invalid email or password', 401));
        }
        const valid = await verify(user.salt, password, user.password);
        if (!valid) {
            return next(CreateError('Invalid email or password', 401));
        }
        const token = jwt.sign(
            { user_id: user.user_id }, process.env.JWT!, { expiresIn: '1h' }
        );
        res.json({ token });
    } catch (err) {
        next(err);
    }
});

app.get('/users/me', authenticator, async (req, res, next) => {
    try {
        const user = await findUser(res.locals.user_id);
        if (user === undefined) {
            return next(CreateError('User not found', 404));
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
});

app.get('/users/:user_id', async (req,res,next)=>{
    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    res.json(user);
})




>>>>>>> Stashed changes
app.use(errorHandler);

app.listen(Number(process.env.port ?? 3000), '0.0.0.0', ()=>{
    console.log(`API running on port ${3000}`);
});

