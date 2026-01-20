import mongoose from "mongoose";
import connectDB from "./db/index.js";
import express from "express";

const app = express();

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("server is running on port :",process.env.PORT);
        
    })
    
})
.catch((err)=>{
    console.log("MONGODB connection failed !!!"+err)
})