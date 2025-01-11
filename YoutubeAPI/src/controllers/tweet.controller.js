import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(401,"User unauthorized")
    }
    const content = req.body.content;
    if (!content) {
        throw new ApiError(400,"Content is Required")
    }
    const tweet = await Tweet.create({
        content,
        user
    })
    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet")
    }

    return res.status(200).json(
        new ApiResponse(200, tweet, "tweet created Successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "UserId is missing")
    }

    const tweets = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets"
            }
        },{
            $addFields: {
                tweets: {
                    $first: "$tweets"
                }
            }
        },{
            $project:{
                fullName: 1,
                tweets: 1,
                userName: 1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])
    if (!tweets?.length) {
        throw new ApiError(404,"Tweets does not exist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets,"Tweets fetched Successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
