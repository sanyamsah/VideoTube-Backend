import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

// asyncHandler takes a function
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "Okay"
    });

    // get user details from frontend......................................................
    const { fullName, email, username, password } = req.body; // object destructuring
    console.log("Email: ", email);

    // validation..........................................................................
    // if(fullName === ""){
    //     throw new ApiError(400, "Full name is required.");
    // }
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
        // returns true if any field is empty even after trim
    ) {
        throw new ApiError(400, "Field is required.");
    }
    // function isValidEmail(email) {
    //     return email.includes('@') && email.indexOf('.') > 0;
    // }
    // if (!isValidEmail(email)) {
    //     throw new ApiError(400, "Valid email required.")
    // }

    // check if user already exists.........................................................
    const existingUser = User.findOne({
        $or: [{ email }, { username }] // checks if email or username already exists
    });
    if (existingUser) {
        throw new ApiError(409, "Email or Username already exists");
    }

    // image handeling......................................................................
    const avatarLocalPath = req.files?.avatar[0]?.path; // files from multer, ? for if can be accessed or not
    // 0th index: first property (taken optionally, contains object), provides path
    if (!avatarLocalPath) {
        throw new ApiError("400", "Avatar file required.");
    }
    const coverImageLocalPath = req.files?.coverImage[0]?.path; // might exist, might not

    // upload them to cloudinary............................................................
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError("400", "Avatar file required.");
    }

    // create user object and upload on database...........................................
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // upload cover image if exists, or keep empty
        email,
        password,
        username: username.toLowerCase()
    })
    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    // check if user is created or not, then return the fields as response except password and refresh token
    if (!userCreated) {
        throw new ApiError(500, "Something went wrong while creating user.");
    } // server error, user not created

    // return response...................................................................
    return res.status(201).json(
        new ApiResponse(200,userCreated,"User registered successfully.")
    );
});

export { registerUser };