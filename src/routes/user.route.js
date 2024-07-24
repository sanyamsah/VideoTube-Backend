import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();
router.route("/register").post(registerUser); // post method, not get: check right one on postman

export default router;