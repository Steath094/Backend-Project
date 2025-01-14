import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401,"User unauthorized")
    }
    const content = req.body.content;
    if (!content || content.trim()=="") {
        throw new ApiError(400,"Content is Required")
    }
    const tweet = await Tweet.create({
        content,
        owner: userId
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
    if (!mongoose.Types.ObjectId.isValid(userId)) {
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
        }
        ,{
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
    const toUpdateContent = req.body.content;
    const { tweetId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400,"Invalid Tweet Id")
    }
    const userId = req.user?.id;
    if (!toUpdateContent) {
        throw new ApiError(400,"Content field is required")
    }
    const tweet =await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner:new mongoose.Types.ObjectId(userId)
        },
        {
            $set:{
                content: toUpdateContent
            }
        }
    );
    if (!tweet) {
        throw new ApiError(400,"Unauthorized Request access");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet updated Successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    try {
        const userId = req.user?._id;
        const { tweetId } = req.params;
        if (!tweetId) {
            throw new ApiError(400,"Tweet id is required");
        }
        const result = await Tweet.deleteOne({_id:tweetId,owner: userId})
        if (result.deletedCount === 0) {
            return res.status(404).json(new ApiResponse(404, null, "Tweeet not found or not authorized"));
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,[],"Tweet Deleted Succesfully")
        )
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Failed to delete tweet"));
    }

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
