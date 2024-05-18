import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHander.js"
import { uploadToCloudinary } from "../utils/cloudinary.js"

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
    let avatar=req.files?.avatar?.[0].path
    let coverImage=req.files?.coverImage?.[0].path
    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const uploadAvatar= await uploadToCloudinary(avatar)
    if(!uploadAvatar){
        throw new ApiError(504," unable to upload avatar")
    }
    let uploadCoverimage;
    if(coverImage){
        uploadCoverimage = await uploadToCloudinary(coverImage)
    }

    const createUser=await User.create({
        username,
        fullName,
        email,
        password,
        avatar:uploadAvatar,
        coverImage:uploadCoverimage
    })




})

export { registerUser }