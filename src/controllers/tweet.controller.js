import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import asyncHandler from "../utils/asyncHander.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createTweet = asyncHandler(async (req, res) => {

    const { content } = req.body

    if (!content?.length) {
        throw new ApiError(400, "Please provide a content")
    }
    const owner = req.user?._id
    const tweet = await Tweet.create({
        content,
        owner,
    })

    if (!tweet) {
        throw new ApiError(500, "Unable to create tweet")
    }

    res.status(201).json(new ApiResponse(201, "Tweet created successfully", tweet))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Invalid tweet id")
    }
    if (!content?.length) {
        throw new ApiError(404, "Please provide a content ")
    }

    const tweet = await Tweet.findByIdAndUpdate(req.user._id, {
        content
    }, { new: true })

    if (!tweet) {
        throw new ApiError(500, "Unable to update tweet")
    }

    res.status(200).json(new ApiResponse(200, "Tweet updated successfully", tweet))
})

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Invalid tweet id")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if (!tweet) {
        throw new ApiError(500, "Unable to delete tweet")
    }

    res.status(200).json(new ApiResponse(200, "Tweet deleted successfully", []))
})

const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid user id")
    }

    const tweets = await Tweet.findById(userId)

    if (!tweets) {
        throw new ApiError(404, "User not found")
    }

    res.status(200).json(new ApiResponse(200, "Tweets found successfully", tweets))

})

export { createTweet, updateTweet, deleteTweet, getUserTweets }


