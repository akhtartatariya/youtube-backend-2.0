import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHander.js";
import jwt from 'jsonwebtoken'
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];

        if (!token) {
            throw new ApiError(401, 'Unauthorized User')
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN)
        const user = await User.findOne({ _id: decodedToken._id })

        if (!user) {
            throw new ApiError(401, 'Unauthorized User')
        }
        req.user = user
        next()
    } catch (error) {

        throw new ApiError(401, 'Unauthorized User', error)

    }


})
