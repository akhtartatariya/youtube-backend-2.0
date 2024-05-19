import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHander.js"
import { uploadToCloudinary } from "../utils/cloudinary.js"


async function generateAccessAndRefreshToken(userId){
    try {

        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, error.message)
    }
}
const registerUser = asyncHandler(async (req, res) => {

    //get req.body
    //validate that body
    //check the user exists 
    // get upload files
    // upload cloudinary
    // check upload is success or not
    // create user
    // check user create or not 
    // send response
    const { username, fullName, email, password } = req.body
    if (!username || !fullName || !email || !password) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({ email, username })
    if (existedUser) {
        throw new ApiError(400, "User already exists")
    }
    let avatar = req.files?.avatar?.[0].path
    let uploadCoverimage;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        uploadCoverimage = req.files.coverImage[0].path;
    }
    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }
    const uploadAvatar = await uploadToCloudinary(avatar)
    const uploadCoverimageCloud = await uploadToCloudinary(uploadCoverimage)
    if (!uploadAvatar) {
        throw new ApiError(504, "unable to upload avatar")
    }

    const createUser = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: uploadAvatar.url,
        coverImage: uploadCoverimageCloud?.url || ""
    })
    if (!createUser) {
        throw new ApiError(500, "Unable to create user")
    }

    res.status(200).json(new ApiResponse(200, "User created successfully", createUser))

})


const loginUser = asyncHandler(async (req, res) => {

    // TODO:
    //get the data from req.body
    // validate the data
    // check user is exist
    // check password is correct
    // generate token
    // send via cookie


    const { username,email, password } = req.body
    if (!(email || username)) {
        throw new ApiError(400, "Email or username is required");
    }
    const isUser = await User.findOne({ $or: [{ username }, { email }] })
    if (!isUser) {
        throw new ApiError(404, "User not found ")
    }

    const isPasswordCorrect = await isUser.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(isUser._id)

    const user = await User.findOne({ _id: isUser._id }).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "Login successfully", user))
})

const logoutUser=asyncHandler(async (req,res)=>{
        
})
export { registerUser, loginUser ,logoutUser}