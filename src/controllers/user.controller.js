import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId); // find user based on id
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken; // save refresh token for that user
        user.save({ validateBeforeSave: false }); // save refresh token in DB
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token.");
    }
}

// asyncHandler takes a function
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "Okay"
    // });
    // console.log(req.body);
    // get user details from frontend......................................................
    const { fullName, email, username, password } = req.body; // object destructuring
    // console.log("Email: ", email);

    // validation..........................................................................
    // if(fullName === ""){
    //     throw new ApiError(400, "Full name is required.");
    // }
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
        // returns true if any field is empty even after trim | Optional chaining
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
    const existingUser = await User.findOne({
        $or: [{ email }, { username }] // checks if email or username already exists
    });
    if (existingUser) {
        throw new ApiError(409, "Email or Username already exists");
    }

    console.log(req.files);

    // image handeling......................................................................
    const avatarLocalPath = req.files?.avatar[0]?.path; // files from multer, ? for if can be accessed or not
    // 0th index: first property (taken optionally, contains object), provides path
    if (!avatarLocalPath) {
        throw new ApiError("400", "Avatar file required.");
    }
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // might exist, might not
    // // Optional chaining | Error: Cannot read properties of undefined (reading '0')
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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
        new ApiResponse(200, userCreated, "User registered successfully.")
    );
});

const loginUser = asyncHandler(async (req, res) => {

    // take data from req.body
    const { username, email, password } = req.body;

    // validate 
    if (!username || !email) {
        throw new ApiError(400, "Username or Email required.");
    }

    // ifnd and check if user exists
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (!user) {
        throw new ApiError(404, "User doesn't exist.");
    }

    // check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials.");
    }

    // make access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // send in cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    // doesn't include password and refresh token in response
    const options = {
        httpOnly: true,
        secure: true
    } // cookie modifiable only by server and not by frontend
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully."
            )
        )

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out.")
        );
});

export { registerUser, loginUser, logoutUser };