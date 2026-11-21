import express from "express";
import { moviesRouter } from "./routes/movies.js";
import { peopleRouter } from "./routes/people.js";
import { usersRouter } from "./routes/users.js"
import { CreateError, errorHandler } from "./Middleware/Errorhandler.js";

export const app = express();

app.use(express.json());

app.use((req, _res, next)=>{
    console.log(`${req.method} ${req.originalUrl}`);
    next();
})

app.use('/movies', moviesRouter);

app.use('/people', peopleRouter);

app.use('/users', usersRouter);


app.use((_req, res)=>{
    CreateError('No such endpoint', 404);
});

app.use(errorHandler);