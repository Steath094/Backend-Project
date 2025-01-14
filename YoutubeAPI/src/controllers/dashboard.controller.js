import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    //Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user?._id;
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const stats = await Video.aggregate([
        {
            $match: { owner: mongoose.Types.ObjectId(channelId) } // Match videos by the owner (channelId)
        },
        {
            $group: {
                _id: '$owner', // Group by the owner (channelId)
                totalViews: { $sum: '$views' }, // Sum of views
                totalLikes: { $sum: '$likes' }, // Sum of likes
                totalVideos: { $count: {} } // Count of videos
            }
        },
        {
            $lookup: {
                from: 'users', // The name of the User collection
                localField: '_id',
                foreignField: '_id',
                as: 'channelDetails' // The name of the field to store the joined user details
            }
        },
        {
            $unwind: {
                path: '$channelDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0, // Exclude the default _id field
                channelId: '$_id', // Include the channel ID
                totalViews: 1, // Include total views
                totalLikes: 1, // Include total likes
                totalVideos: 1, // Include total videos
                totalSubscribers: { $size: '$channelDetails.subscribers' }, // Count subscribers from the channel details
                channelName: '$channelDetails.username', // Include channel name
                channelAvatar: '$channelDetails.avatar' // Include channel avatar
            }
        }
    ]);

    // Check if any stats were found
    if (stats.length === 0) {
        throw new ApiError(404, "No stats found for this channel");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,stats[0],"Stats Fetched Succesfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    //Get all the videos uploaded by the channel
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400,"unauthorize user access");
    }
    const videoList = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },{
            $project:{
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                isPublished: 1
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])
    if (videoList.length===0) {
        return res.status(200).json(200,[], "No Videos Found")
    }
    return res
    .status(200)
    .json(200,videoList, "Videos Fetched Successfully")
})

export {
    getChannelStats, 
    getChannelVideos
    }