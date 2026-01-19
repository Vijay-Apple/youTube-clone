import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv"
dotenv.config();
async function connectDB() {
    try {
        const connectionInstatnce = await mongoose.connect(`${process.env.MONGODB_URI}/ and name is : ${DB_NAME}`);
        console.log(`\n MongoDB is connected !! DB Host: ${connectionInstatnce.connection.host}`);

    } catch (error) {
        console.log("MONGODB connectin error:", error);
        process.exit(1);

    }
}

export default connectDB; 


//FIRST APPROACH TO CONNECT DB

/*import express from 'express';

const app =express();

(async ()=>{
    try {
        await mongoose.connect(`mongoDb connected from ${process.env.MONGODB_URI}/and db Name is : ${DB_NAME}`)
        app.on("error",()=>{
            console.log("db is not able to connect you");
            throw error
            
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listenning on prot ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("Error:"+error);
        throw error;
    }

})();*/


