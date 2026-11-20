import 'dotenv/config'
import express from 'express'
import { findMovie, listMovies } from './Model/movies.js';
import { pool } from './db.js';
import { findPerson, listPeople } from './Model/people.js';

import { createUser, createUserMovieBookmark, createUserPersonBookmark, createUserReview, createUserSearch, deleteUserMovieBookmark, deleteUserPersonBookmark, deleteUserReview, findUser, findUserBookmarks, findUserPersonBookmarks, findUserReviews, listUsers, listUserSearches, updateUserReview } from './Model/users.js';
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

app.post('/users/:user_id/bookmark/movie', async (req,res,next)=>{
    try{const bookmark = await createUserMovieBookmark(req.params.user_id,req.body.tconst);
    if (typeof(bookmark)!=="string"){
        return next(CreateError('User or Movie not allowed', 400));
    }
    res.status(201).location(`/users/${req.params.user_id}/bookmarks/movies/${bookmark}`).json(bookmark);
    } catch (err){
        next(err);
    }
})

app.get('/users/:user_id/bookmarks/movies', async (req,res,next)=>{
    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    const user_bookmark = await findUserBookmarks(req.params.user_id);
    res.json(user_bookmark);
})

app.delete('/users/:user_id/bookmarks/movies/:tconst', async (req,res,next)=>{
    try{
        res.status(204).json(deleteUserMovieBookmark(req.params.user_id,req.params.tconst));
    } catch (err){
        next(err);
    }
})

app.post('/users/:user_id/bookmark/person', async (req,res,next)=>{
    try{const bookmark = await createUserPersonBookmark(req.params.user_id,req.body.nconst);
        if (typeof(bookmark)!=="string"){
            return next(CreateError('User or Person not allowed', 400));
        }
        res.status(201).location(`/users/${req.params.user_id}/bookmarks/people/${bookmark}`).json(bookmark);
    } catch (err){
        next(err)
    }
})

app.get('/users/:user_id/bookmarks/people', async (req,res,next)=>{
    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    const user_bookmark = await findUserPersonBookmarks(req.params.user_id);
    res.json(user_bookmark);
})

app.delete('/users/:user_id/bookmarks/people/:nconst', async (req,res,next)=>{
    try{
        res.status(204).json(deleteUserPersonBookmark(req.params.user_id,req.params.nconst));
    } catch (err){
        next(err);
    }
})

app.post('/users/:user_id/rating', async (req,res,next)=>{
    try{const rating = await createUserReview(req.params.user_id,req.body.tconst,req.body.score)
        if (rating===undefined){
            return next(CreateError('Score not allowed', 400))
        }
        res.status(201).location(`/users/${req.params.user_id}/ratings/${req.body.tconst}`).json(rating);
    } catch (err){
        next(err)
    }
})

app.get('/users/:user_id/ratings', async (req,res,next)=>{
    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    const user_review = await findUserReviews(req.params.user_id);
    res.json(user_review);
})

app.delete('/users/:user_id/ratings/:tconst', async (req,res,next)=>{
    try{
        res.status(204).json(deleteUserReview(req.params.user_id,req.params.tconst));
    } catch (err){
        next(err);
    }
})

app.patch('/users/:user_id/ratings/:tconst', async (req,res,next)=>{
    try{
        res.status(200).json(updateUserReview(req.params.user_id,req.params.tconst,req.body.score));
    } catch (err){
        next(err);
    }
})

app.post('/users/:user_id/search', async (req,res,next)=>{
    try{    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    res.status(201).location(`/users/${req.params.user_id}/searches`).json(createUserSearch(req.params.user_id,req.body.search));
    } catch (err){
        next(err);
    }
})

app.get('/users/:user_id/searches', async (req,res,next)=>{
    const user = await findUser(req.params.user_id);
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    const searches = await listUserSearches(req.params.user_id);
    res.json(searches);
})

app.use(errorHandler);


app.listen(Number(process.env.port ?? 3000), '0.0.0.0', ()=>{
    console.log(`API running on port ${3000}`);
});

