import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHander.js"
import { deleteToClodinary, uploadToCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

async function generateAccessAndRefreshToken(userId) {
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


    const { username, email, password } = req.body
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

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findOneAndUpdate({ _id: req.user._id }, {
        $unset: {
            refreshToken: 1
        },
    }, {
        new: true,
    })
    if (!user) {
        throw new ApiError(403, "User not found");
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(201, "logout successfully", []))
})

const getCurrentUser = asyncHandler(async (req, res) => {

    res.status(200).json(new ApiResponse(201, "user found successfully", req.user))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized user")
    }


    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN)
        if (!decodedToken) {
            throw new ApiError(500, "Something went wrong")
        }

        const user = await User.findOne({ _id: decodedToken._id })

        if (!user) {
            throw new ApiError(404, "User not found")
        }
        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized user")
        }
        const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id)
        const userResponse = await User.findOne({ _id: user._id }).select("-password -refreshToken")
        const options = {
            httpOnly: true,
            secure: true
        }
        res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, "user found successfully", userResponse))
    } catch (error) {

        throw new ApiError(500, error.message)
    }
})

const updateAvatarImage = asyncHandler(async (req, res) => {

    // console.log(req.user)
    const avatar = req.file
    // console.log(avatar.path)
    if (!avatar) {
        throw new ApiError(400, "File not found")
    }
    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const uploadAvatar = await uploadToCloudinary(avatar.path)
    if (!uploadAvatar) {
        throw new ApiError(504, "unable to upload avatar")
    }
    const pattern = /\/v\d+\/([^\/]+)\./;

    const match = user.avatar.match(pattern);
    if (!match) {
        throw new ApiError(500, "unable to match avatar url")
    }
    const deleteOldAvatar = await deleteToClodinary(match[1])

    if (!deleteOldAvatar) {
        throw new ApiError(504, "unable to delete old avatar")
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        avatar: uploadAvatar.url

    }, { new: true }).select("-password -refreshToken")

    if (!updatedUser) {
        throw new ApiError(500, "unable to update user")
    }

    res.status(200).json(new ApiResponse(200, "avatar image updated successfully", updatedUser))

})
const updateCoverImage = asyncHandler(async (req, res) => {

    // console.log(req.user)
    const coverImage = req.file
    // console.log(avatar.path)
    if (!coverImage) {
        throw new ApiError(400, "File not found")
    }
    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const uploadCoverImage = await uploadToCloudinary(coverImage.path)
    if (!uploadCoverImage) {
        throw new ApiError(504, "unable to upload coverImage")
    }
    if (!user.coverImage == "") {

        const pattern = /\/v\d+\/([^\/]+)\./;

        const match = user.coverImage.match(pattern);
        if (!match) {
            throw new ApiError(500, "unable to match cover image url")
        }
        const deleteOldCoverImage = await deleteToClodinary(match[1])

        if (!deleteOldCoverImage) {
            throw new ApiError(504, "unable to delete old cover image")
        }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        coverImage: uploadCoverImage.url

    }, { new: true }).select("-password -refreshToken")

    if (!updatedUser) {
        throw new ApiError(500, "unable to update user")
    }

    res.status(200).json(new ApiResponse(200, "cover image updated successfully", updatedUser))

})
const updateUserDetails = asyncHandler(async (req, res) => {
    const { username, fullName, email } = req.body

    if (!username || !fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        username,
        fullName,
        email
    }, { new: true }).select("-password -refreshToken")
    if (!updatedUser) {
        throw new ApiError(500, "unable to update user")
    }
    res.status(200).json(new ApiResponse(200, "user details updated successfully", updatedUser))
})


const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
        throw new ApiError(403, " All fields are required")
    }
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "password is incorrect")
    }
    user.password = newPassword
    const updatedUser = await user.save()


    res.status(200).json(new ApiResponse(200, "password updated successfully", updatedUser))

})

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    const getProfile = await User.aggregate([
        {
            $match: {
                username
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribers: {
                    $size: "$subscribers"
                },
                subscribedTo: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                coverImage: 1,
                email: 1,


            }
        }
    ])

    res.status(200).json(new ApiResponse(200, "user found successfully", getProfile[0]))
})

const getWatchHistory = asyncHandler(async (req, res) => {

    const watchHistory = await User.aggregate([
        {
            $match: {
                _id: req.user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,

                                    }
                                },
                            ]
                        }
                    },

                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }

                ]
            }
        }
    ])

    res.status(200).json(new ApiResponse(200, "watch history found successfully", watchHistory[0]))
})
export { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken, updateAvatarImage, updateCoverImage, updateUserDetails, changePassword, getUserProfile, getWatchHistory }