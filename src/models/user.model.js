import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true, // for removing leadning & trailing whitespace from the field
        lowercase: true,
        index: true // makes searching faster but makes expensive
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

// userSchema.pre("save",async function(next){
//     this.password = bcrypt.hash(this.password,10);
//     next();
// }); // Whenever some other field is changed(for example, avatar), password is also changed

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    } // if password is not changed, move to next step
    this.password = await bcrypt.hash(this.password, 10); // 10 stands for rounds in the hashing algo
    next();
});

// explicit function in schema for checking password using bcrypt
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // this can be accessed by methods
    // (password, encrypted password) comparison, returns boolean value
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id, // from mongodb
            username: this.username,
            email: this.email,
            fullName: this.fullName
        }, process.env.SECRET_ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        }, process.env.SECRET_REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);