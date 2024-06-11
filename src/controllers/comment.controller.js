// getVideoComments, addComment , updateComment, deleteComment

import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import asyncHandler from "../utils/asyncHander.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "invalid video id")
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Please provide a content")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const comment = await Comment.create({
        content,
        video: video._id,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(500, "Unable to add comment")
    }
    res.status(200).json(new ApiResponse(200, "Comment added successfully", comment))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    if (!isValidObjectId(commentId)) {
        throw new ApiError(403, "Invalid comment id")
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Please provide a content")
    }
    const comment = await Comment.findOneAndUpdate({ _id: commentId, owner: req.user._id }, { content }, { new: true })
    if (!comment) {
        throw new ApiError(500, "Unable to update comment")
    }
    res.status(200).json(new ApiResponse(200, "Comment updated successfully", comment))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(403, "Invalid comment id")
    }
    const comment = await Comment.findOneAndDelete({ _id: commentId, owner: req.user._id })
    if (!comment) {
        throw new ApiError(500, "Unable to delete comment")
    }
    res.status(200).json(new ApiResponse(200, "Comment deleted successfully", []))
})

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(403, "Invalid video id")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(403, "video not found")
    }
    const comments = await Comment.aggregate([
        {
            $match: {
                video: video._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner.username"
                }
            }
        },
        {
            $project: {
                owner: 1,
                content: 1
            }
        }
    ])
    res.status(200).json(new ApiResponse(200, "Comments fetched successfully", comments))
})
export { addComment, updateComment, deleteComment ,getVideoComments}