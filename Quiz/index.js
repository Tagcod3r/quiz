import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';  
import bodyparser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';
import 'dotenv/config';


dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'Views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyparser.urlencoded({extended:true}));


const db= new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
}); 

db.connect();

let CnC =[];
db.query("SELECT * FROM capital",(err,res)=>{
    if(err)
    {
      console.error("Error executing query", err.stack);
    }else{
        CnC=res.rows;
    }
    db.end();
});

/*
const CnC = {
    "USA": "Washington, D.C.",
    "France": "Paris",
    "Germany": "Berlin",
    "Japan": "Tokyo"
};*/

let score=0;
app.get('/', (req, res) => {

    score=0;

    const index = Math.floor(Math.random()*CnC.length);
    const randomcountry = CnC[index].country;
    const capital = CnC[index].capital;
    let gameover = false;  
    let alert = '';
    res.render('home', { country: randomcountry, capital: capital, score: score ,alertMessage: alert, gameOver:gameover });
});


app.post('/', (req, res) => {
    const userAnswer = req.body.capital.trim().toLowerCase();
    const correctAnswer = req.body.correctCapital.toLowerCase();
    
    let gameover =false;
    let updatescore =0;
    let alert = '';
    if (userAnswer === correctAnswer) {
        score++; 
    }else if(userAnswer === ''){
            score=0;
    }else{
        updatescore=score;
        score=0;
        gameover=true;
        alert = 'Game Over! Your final score';
    }


    const randomIndex = Math.floor(Math.random() * CnC.length);
    const randomcountry = CnC[randomIndex].country; 
    const capital = CnC[randomIndex].capital;  

    res.render('home', { country: randomcountry, capital: capital, score: score, alertMessage: alert, gameOver:gameover, finals:updatescore });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
