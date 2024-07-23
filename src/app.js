import express from express;
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

export { app }; // export default app