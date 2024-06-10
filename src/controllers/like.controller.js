//toggleVideoLike , toggleCommentLike , toggleTweetLike ,  getLikedVideos

import { get, isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHander.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    const liked = await Like.findOne({ video: videoId, likedBy: req.user._id })

    if (liked) {
        const deletedLike = await Like.findOneAndDelete({ _id: liked._id })
        if (!deletedLike) {
            throw new ApiError(500, "unable to delete like")
        }
        res.status(200).json(new ApiResponse(200, "unliked successfully", []))
    }
    else {
        const like = await Like.create({ likedBy: req.user._id, video: videoId })
        if (!like) {
            throw new ApiError(500, "unable to like video")
        }
        res.status(200).json(new ApiResponse(200, "liked successfully", like))
    }
})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "invalid comment id")
    }

    const comment = await Comment.findOne({ _id: commentId })
    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    const liked = await Like.findOne({ comment: comment._id, likedBy: req.user._id })

    if (liked) {
        const deletedLike = await Like.findOneAndDelete({ _id: liked._id })
        if (!deletedLike) {
            throw new ApiError(500, "unable to delete like")
        }
        res.status(200).json(new ApiResponse(200, "unliked successfully", []))
    }
    else {
        const like = await Like.create({ likedBy: req.user._id, comment: comment._id })
        if (!like) {
            throw new ApiError(500, "unable to like comment")
        }
        res.status(200).json(new ApiResponse(200, "liked successfully", like))
    }
})
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "tweet not found")
    }

    const liked = await Like.findOne({ tweet: tweet._id, likedBy: req.user._id })

    if (liked) {
        const deletedLike = await Like.findOneAndDelete({ _id: liked._id })
        if (!deletedLike) {
            throw new ApiError(500, "unable to delete like")
        }
        res.status(200).json(new ApiResponse(200, "unliked successfully", []))
    }
    else {
        const like = await Like.create({ likedBy: req.user._id, tweet: tweet._id })
        if (!like) {
            throw new ApiError(500, "unable to like tweet")
        }
        res.status(200).json(new ApiResponse(200, "liked successfully", like))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const LikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
            $group: {
                _id: '$video',
                LikedVideos: { $push: '$video' },
            }
        },
    ])
    if(!LikedVideos){
        throw new ApiError(500, "unable to get liked videos")
    }
    res.status(200).json(new ApiResponse(200, "liked videos found successfully", LikedVideos))
})
export { toggleVideoLike, toggleCommentLike, toggleTweetLike ,getLikedVideos}