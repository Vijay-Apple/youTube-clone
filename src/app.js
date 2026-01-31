import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

//third -party middleware cors , helmet ,rate-limiting 

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}));

// built-in middlewares  json ,urlEncoded , static

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"));

//cookieparser

app.use(cookieParser());

//import routes
import userRoutes from './routes/user.routes.js'

//routes declarsation
app.use('/api/v1/users', userRoutes);


// app.get("/test", (req, res) => {
//     res.send("Api is working")
// });

export { app };



