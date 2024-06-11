// createPlaylist, updatePlaylist , deletePlaylist, addVideoFromPlaylist , removeVideoFromPlaylist

import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHander.js";
import { Video } from "../models/video.model.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name || !description) {
        throw new ApiError(400, "All fields are required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })
    if (!playlist) {
        throw new ApiError(500, " unable to create playlist")
    }
    res.status(200).json(new ApiResponse(200, "Playlist created successfully", playlist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlist id")
    }
    if (!name || !description) {
        throw new ApiError(400, "All fields are required")
    }
    const playlist = await Playlist.findOneAndUpdate({ _id: playlistId, owner: req.user._id }, {
        name,
        description
    }, { new: true })
    if (!playlist) {
        throw new ApiError(500, "unable to update playlist")
    }
    res.status(200).json(new ApiResponse(200, "Playlist updated successfully", playlist))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlist id")
    }
    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, owner: req.user._id })
    if (!playlist) {
        throw new ApiError(500, " unable to delete playlist")
    }
    res.status(200).json(new ApiResponse(200, "Playlist deleted successfully", []))
})

const addVideoPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params
    if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid video or playlist id")
    }
    const video = await Video.findOne({ _id: videoId, owner: req.user._id })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const playlist = await Playlist.findOneAndUpdate({ _id: playlistId, owner: req.user._id }, {
        $addToSet: {
            videos: video._id
        }
    }, { new: true })

    if (!playlist) {
        throw new ApiError(500, "Unable to add video to playlist")
    }

    res.status(200).json(new ApiResponse(200, "Video added to playlist successfully", playlist))
})
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params
    if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid video or playlist id")
    }
    const video = await Video.findOne({ _id: videoId, owner: req.user._id })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {
            videos: video._id
        }
    }, { new: true })

    if (!playlist) {
        throw new ApiError(500, "Unable to remove video from playlist")
    }

    res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully", playlist))
})
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid user id")
    }
    const playlists = await Playlist.find({ owner: userId })
    if (!playlists) {
        throw new ApiError(404, "Playlists not found")
    }
    res.status(200).json(new ApiResponse(200, "Playlists found successfully", playlists))
})
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    res.status(200).json(new ApiResponse(200, "Playlist found successfully", playlist))
})
export { createPlaylist, updatePlaylist, deletePlaylist, addVideoPlaylist, removeVideoFromPlaylist, getPlaylistById, getUserPlaylists }