// getvideobyid, getAllVideos, publishvideo, updatevideo, deletevideo ,togglePublishStatus

import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHander.js";
import { deleteToClodinary, uploadToCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = ``, sortBy = 'createdAt', sortType = "asc", userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const videos = await Video.find({ title: { $regex: query, $options: "i" } }).sort({ [sortBy]: sortType }).skip((page - 1) * limit).limit(limit);

    if (!videos) {
        throw new ApiError(404, "Video not found")
    }

    res.status(200).json(new ApiResponse(200, "Videos found successfully", videos))
})

const publishVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(404, "Please provide a title and description")
    }
    const videoFile = req.files?.videoFile?.[0].path
    const thumbnail = req.files?.thumbnail?.[0].path

    if (!videoFile) {
        throw new ApiError(404, "Please provide a video file")
    }

    if (!thumbnail) {
        throw new ApiError(404, "Please provide a thumbnail")
    }


    const uploadedVideo = await uploadToCloudinary(videoFile)
    const uploadedThumbnail = await uploadToCloudinary(thumbnail)

    const video = await Video.create({
        title,
        description,
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        owner: req.user?._id,
        duration: uploadedVideo.duration
    })
    if (!video) {
        throw new ApiError(500, "Unable to publish video")
    }

    res.status(201).json(new ApiResponse(201, "Video published successfully", video))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video id")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }

        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {
            $addFields: {
                owner: {
                    $first: '$owner.username',
                }

            }
        },
        {
            $project: {
                owner: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                views: 1,
                duration: 1,
                createdAt: 1,
                updatedAt: 1,
                isPublished: 1,

            }
        }
    ])
    res.status(200).json(new ApiResponse(200, "Video found successfully", video))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video id")
    }
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    const video = await Video.findById(videoId)
    const thumbnail = req.file
    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const uploadThumbnail = await uploadToCloudinary(thumbnail.path)
    if (!uploadThumbnail) {
        throw new ApiError(500, "unable to upload thumbnail")
    }

    const pattern = /\/v\d+\/([^\/]+)\./;

    const match = video.thumbnail.match(pattern)

    if (!match) {
        throw new ApiError(500, "unable to match thumbnail url")
    }

    const deleteOldThumbnail = await deleteToClodinary(match[1])

    if (!deleteOldThumbnail) {
        throw new ApiError(504, "unable to delete old thumbnail")
    }
    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        thumbnail: uploadThumbnail.url

    }, {
        new: true
    })

    res.status(200).json(new ApiResponse(200, "Video updated successfully", updatedVideo))
})

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video id")
    }
    const video = await Video.findOne({ _id: videoId, owner: req.user._id })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(500, "Unable to delete video")
    }
    res.status(200).json(new ApiResponse(200, "Video deleted successfully", []))
})

const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const publishStatus = video.isPublished
    const updatedVideo = await Video.findOneAndUpdate({ _id: videoId, owner: req.user._id }, {
        isPublished: !publishStatus
    }, {
        new: true
    })

    res.status(200).json(new ApiResponse(200, "change publish status successfully", updatedVideo))
})
export { getAllVideos, publishVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }