import { asyncHandler } from "../utils/asyncHandler.js";

// asyncHandler takes a function
const registerUser = asyncHandler((req, res) => {
    res.status(200).json({
        message: "Okay"
    });
});

export {registerUser};