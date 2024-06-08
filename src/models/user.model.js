import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ]

}, { timestamps: true })


userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: process.env.EXPIRY_REFRESH_TOKEN,
        },
        
    )
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, username: this.username, fullName: this.fullName, email: this.email },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.EXPIRY_ACCESS_TOKEN
        }
    )
}
export const User = mongoose.model("User", userSchema)