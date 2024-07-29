import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
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

// secure routes
router.route("/logout").post(verityJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;