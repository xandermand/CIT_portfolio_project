import { Router } from "express";
import * as users from "../data/users.js";
import { CreateError } from "../Middleware/Errorhandler.js";
import { validateNewUser } from "../services/validator.js";
import jwt from 'jsonwebtoken';
import { verify } from "../services/passwordmanager.js";
import { authenticator } from "../Middleware/Authenticator.js";

export const usersRouter = Router()

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function pageOf(query: Record<string, unknown>): { limit: number; offset: number} {
    const asked = Number(query.limit ?? DEFAULT_LIMIT);
    const limit = Number.isFinite(asked) && asked > 0 ? Math.min(asked, MAX_LIMIT) : DEFAULT_LIMIT;
    const from = Number(query.offset ?? 0);
    const offset = Number.isFinite(from) && from >= 0 ? from : 0;
    return { limit, offset};
}

usersRouter.get('/', async (req,res,next)=>{
    try{
        const {limit,offset} = pageOf(req.query as Record<string,unknown>);
        res.json(await users.listUsers(limit,offset));
    } catch(err){
        next(err);
    }
});

usersRouter.post('/register', async (req,res, next)=>{
    try{const input = validateNewUser(req.body);
    if (input === undefined){
        return next(CreateError('Email, Password or Username is not allowed', 400));
    }
    const created = await users.createUser(input);
    res.status(201).location(`/users/${created}`).json(created);
} catch (err){
    next(err);
}})

usersRouter.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await users.findUserPassword(email);
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

usersRouter.get('/me', authenticator, async (req, res, next) => {
    try {
        const user = await users.findUser(res.locals.user_id);
        if (user === undefined) {
            return next(CreateError('User not found', 404));
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
});

usersRouter.get('/:user_id', async (req,res,next)=>{
    try{
        const user = await users.findUser(req.params.user_id);
        if (user===undefined){
            return next(CreateError('User not found', 404));
        }
        res.json(user);
    } catch (err){
        next(err);
    }
})

usersRouter.post('/me/bookmark/movie', authenticator, async (req,res,next)=>{
    try{const bookmark = await users.createUserMovieBookmark(res.locals.user_id,req.body.tconst);
    if (typeof(bookmark)!=="string"){
        return next(CreateError('User or Movie not allowed', 400));
    }
    res.status(201).location(`/users/${res.locals.user_id}/bookmarks/movies/${bookmark}`).json(bookmark);
    } catch (err){
        next(err);
    }
})

usersRouter.get('/:user_id/bookmarks/movies', async (req,res,next)=>{
    try{
        const user = await users.findUser(req.params.user_id);
        if (user===undefined){
            return next(CreateError('User not found', 404));
        }
        const user_bookmark = await users.findUserBookmarks(req.params.user_id);
        res.json(user_bookmark);
    } catch(err){
        next(err);
    }
})

usersRouter.delete('/me/bookmarks/movies/:tconst',authenticator, async (req,res,next)=>{
    try{
        res.status(204).json(users.deleteUserMovieBookmark(res.locals.user_id,req.params.tconst.toString()));
    } catch (err){
        next(err);
    }
})

usersRouter.post('/me/bookmark/person', authenticator, async (req,res,next)=>{
    try{const bookmark = await users.createUserPersonBookmark(res.locals.user_id,req.body.nconst);
        if (typeof(bookmark)!=="string"){
            return next(CreateError('User or Person not allowed', 400));
        }
        res.status(201).location(`/users/${res.locals.user_id}/bookmarks/people/${bookmark}`).json(bookmark);
    } catch (err){
        next(err)
    }
})

usersRouter.get('/:user_id/bookmarks/people', async (req,res,next)=>{
    try{
        const user = await users.findUser(req.params.user_id);
        if (user===undefined){
            return next(CreateError('User not found', 404));
        }
        const user_bookmark = await users.findUserPersonBookmarks(req.params.user_id);
        res.json(user_bookmark);
    } catch(err){
        next(err);
    }    
})

usersRouter.delete('/me/bookmarks/people/:nconst',authenticator, async (req,res,next)=>{
    try{
        res.status(204).json(users.deleteUserPersonBookmark(res.locals.user_id.toString(),req.params.nconst.toString()));
    } catch (err){
        next(err);
    }
})

usersRouter.post('/me/rating',authenticator, async (req,res,next)=>{
    try{const rating = await users.createUserReview(res.locals.user_id.toString(),req.body.tconst,req.body.score)
        if (rating===undefined){
            return next(CreateError('Score not allowed', 400))
        }
        res.status(201).location(`/users/${res.locals.user_id}/ratings/${req.body.tconst}`).json(rating);
    } catch (err){
        next(err)
    }
})

usersRouter.get('/:user_id/ratings', async (req,res,next)=>{
    try{
        const user = await users.findUser(req.params.user_id);
        if (user===undefined){
            return next(CreateError('User not found', 404));
        }
        const user_review = await users.findUserReviews(req.params.user_id);
        res.json(user_review);
    } catch (err){
        next(err);
    }
})

usersRouter.delete('/me/ratings/:tconst', authenticator,async (req,res,next)=>{
    try{
        res.status(204).json(users.deleteUserReview(res.locals.user_id.toString(),req.params.tconst.toString()));
    } catch (err){
        next(err);
    }
})

usersRouter.patch('/me/ratings/:tconst',authenticator, async (req,res,next)=>{
    try{
        res.status(200).json(users.updateUserReview(res.locals.user_id.toString(),req.params.tconst.toString(),req.body.score));
    } catch (err){
        next(err);
    }
})

usersRouter.post('/me/search',authenticator, async (req,res,next)=>{
    try{    const user = await users.findUser(res.locals.user_id.toString());
    if (user===undefined){
        return next(CreateError('User not found', 404));
    }
    res.status(201).location(`/users/${res.locals.user_id}/searches`).json(users.createUserSearch(res.locals.user_id.toString(),req.body.search));
    } catch (err){
        next(err);
    }
})

usersRouter.get('/:user_id/searches', async (req,res,next)=>{
    try{
        const user = await users.findUser(req.params.user_id);
        if (user===undefined){
            return next(CreateError('User not found', 404));
        }
        const searches = await users.listUserSearches(req.params.user_id);
        res.json(searches);
    } catch (err){
        next(err);
    }
})
