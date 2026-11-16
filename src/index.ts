import pg from 'pg'
import express from 'express'
const {Pool, Client} = pg
const app = express()




const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {rejectUnauthorized: false},
})

app.use(express.json());

app.get('/api/test', (req,res)=> {
    res.json({
        message: 'API is working!',
    });
});

app.listen(Number(process.env.port ?? 3000), '0.0.0.0', ()=>{
    console.log('API running on port ${port}');
});