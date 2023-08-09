const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const connectDatabase = require('./helpers/database/connectDatabase')
const routers = require('./routers')
const customErrorHandler = require('./middlewares/errors/customErrorHandler')
const cors = require('cors');
dotenv.config()

connectDatabase()

const app = express()
app.use(cors({
  origin: 'https://kckmadia.netlify.app', // İzin verilen kök URL
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'], // İzin verilen HTTP metodları
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'], // İzin verilen başlıklar
  credentials: true, // Kimlik doğrulama bilgilerini (örneğin, çerezler) paylaşma izni
  exposedHeaders: ['Authorization'] // İzin verilen gösterilen başlık (opsiyonel)
}));
app.use(express.static('public'));



app.use(cookieParser());
app.use(express.json());
const PORT = process.env.PORT;

app.use("/api", routers)

app.use(customErrorHandler);


app.listen(PORT, () => {
    console.log(`App Started on ${PORT} : ${process.env.NODE_ENV}`);
  });
  //556045
  
