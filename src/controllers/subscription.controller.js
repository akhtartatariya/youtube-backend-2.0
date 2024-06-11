//toggleSubscription , getchannelSubscribers , getSubscribedChannels

import mongoose, { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHander.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    //validate channelId
    //find channel and check user is subscribed or not
    TODO://if user is subscribed then unsubscribe else subscribe
    //send response
    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "Invalid channel id")
    }
    const channel = await Subscription.findOne({ channel: channelId, subscriber: req.user?._id })
    if (channel) {
        const channel = await Subscription.findOneAndDelete({ channel: channelId, subscriber: req.user?._id })

        if (!channel) {
            throw new ApiError(500, "Unable to toggle subscription")
        }

        res.status(200).json(new ApiResponse(200, "Subscription toggled successfully", []))
    }
    else {
        const channel = await Subscription.create({ channel: channelId, subscriber: req.user?._id })
        if (!channel) {
            throw new ApiError(500, "Unable to toggle subscription")
        }
        res.status(200).json(new ApiResponse(200, "Subscription toggled successfully", channel))
    }
})

const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "Invalid channel id")
    }
    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            },
        },
        {
            $group: {
                _id: '$channel',
                subscriberCount: { $sum: 1 },
                subscribers: { $push: '$subscriber' }
            }
        },
    
    ])
    if(!channelSubscribers){
        throw new ApiError(500, "Unable to get subscribers")
    }

    res.status(200).json(new ApiResponse(200, "Subscribers fetched successfully", channelSubscribers))
})
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(404, "Invalid channel id")
    }
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: "subscribedTo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            },
        },
        {
            $group: {
                _id: '$subscriber',
                subscribedToCount: { $sum: 1 },
                subscribedTo: { $push: '$channel' }
            }
        },
        

    ])
    if(!subscribedChannels){
        throw new ApiError(500, "Unable to get subscribed channels")
    }
    res.status(200).json(new ApiResponse(200, "Subscribers fetched successfully", subscribedChannels))
})
export { toggleSubscription, getChannelSubscribers , getSubscribedChannels }