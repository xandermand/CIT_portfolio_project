import pg from 'pg'
import express from 'express'
const {Pool, Client} = pg
const app = express()




const client = new Client({
    user: 'cit15',
    password: '9j5lfRjMsUPH',
    host: 'cit.ruc.dk',
    port: 5432,
    database: 'cit15',
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