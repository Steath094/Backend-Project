import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400,"Invalid Channel Id")
    }
    const userId = req.user?._id;
    const isSubscribed = await Subscription.find({subscriber: userId,channel: channelId})
    if (isSubscribed) {
        await Subscription.deleteOne({subscriber: userId,channel: channelId})
        return res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribed to channel"));
    }else{
        await Subscription.create({subscriber: userId,channel: channelId})
        return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "Subscribed to channel"));
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400,"Invalid Channel Id")
    }
    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: 'users', // Assuming your User model collection is named 'users'
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriberDetails'
            }
        },
        {
            $unwind: '$subscriberDetails'
        },
        {
            $project: {
                _id: 0,
                subscriberId: '$subscriberDetails._id',
                name: '$subscriberDetails.name',
                avatar: '$subscriberDetails.avatar',
                userName: '$subscriberDetails.userName'
            }
        }
    ]);
    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribers,"Subscriber list fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400,"Invalid Channel Id")
    }
    const channels = new Subscription.aggregate[
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup:{
                from: 'users', // Assuming your User model collection is named 'users'
                localField: 'channel',
                foreignField: '_id',
                as: 'channelDetails'
            }
        },{
            $unwind: "$channelDetails"
        },{
            $project: {
                _id: 0,
                channelId: '$channelDetails._id',
                name: '$channelDetails.name',
                avatar: '$channelDetails.avatar',
                userName: '$channelDetails.userName'
            }
        }
    ]
    return res
    .status(200)
    .json(
        new ApiResponse(200,channels,"Channel list fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}