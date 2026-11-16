import express from 'express'
import { listMovies } from './Model/movies.js';
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


app.listen(Number(process.env.PGPORT ?? 3000), '0.0.0.0', ()=>{
    console.log(`API running on port ${3000}`);
});