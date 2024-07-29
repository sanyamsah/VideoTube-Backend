import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verityJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([ // takes an array
        { 
            name: "avatar",
            maxCount: 1 // same field-name as in frontend
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), // returns middlewares which process multiple files from the fields
    registerUser
); // post method, not get: check right one on postman

router.route("/login").post(loginUser);

router.route("/logout").post(verityJWT, logoutUser);

export default router;