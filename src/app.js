import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // to perform CRUD operations on cookies in the user's browser

const app = express();

// app.use(cors()); 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit: "16kb"
})); // for handeling json data

// app.use(express.urlencoded());
app.use(express.urlencoded({
    limit: "16kb",
    extended: true
})); // for handeling urls

app.use(express.static("public")); // to store assets (images, files, etc)

app.use(cookieParser());

// import router
import userRouter from "./routes/user.route.js";
// declare routes
// app.use("/users",userRouter); // when /user is accessed, control is handed over to userRouter
// http://localhost:8000/users
app.use("/api/v1/users", userRouter);
// http://localhost:8000/api/v1/users

export { app }; // export default app