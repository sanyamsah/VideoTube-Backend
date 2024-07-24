// require('dotenv').config({path:'./env'}); // disturbs consistency of code

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
    path: './.env'
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 4000, () => {
            console.log(`Server is listening at port: ${process.env.PORT}`);
        })
    })
    .catch((error) => {
        console.log("MONGODB CONNECTION FAILED: ", error);
    })

/*
import express from "express";
const app = express();
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log('ERROR: ', error);
            throw error;
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log('ERROR: ', error);
        throw error;
    }
})()
*/ // Connecting database approach 1: in index.js file