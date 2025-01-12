import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { formatDistanceToNowStrict } from 'date-fns';
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const userId = req.user?._id;
    const exsistingLike =await Like.findOne({video: videoId,likedBy: userId})
    if (exsistingLike) {
        await Like.findByIdAndDelete(exsistingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Like on Video removed successfully"));
    }else{
        await Like.create({video: videoId,likedBy: userId})
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Like on video added successfully"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid CommentId");
    }
    const userId = req.user?._id;
    const exsistingLike =await Like.findOne({comment: commentId,likedBy: userId})
    if (exsistingLike) {
        await Like.findByIdAndDelete(exsistingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Like on Comment removed successfully"));
    }else{
        await Like.create({comment: commentId,likedBy: userId})
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Like n Comment added successfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid TweetId");
    }
    const userId = req.user?._id;
    const exsistingLike =await Like.findOne({tweet: tweetId,likedBy: userId})
    if (exsistingLike) {
        await Like.findByIdAndDelete(exsistingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Like on Tweet removed successfully"));
    }else{
        await Like.create({tweet: tweetId,likedBy: userId})
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Like n Tweet added successfully"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const likedVideos = await Like.find({likedBy: userId}).populate({
        path: "video",
        populate:{
            path: "owner",
            select : "userName avatar"
        },
    })
    if (!likedVideos?.length) {
        throw new ApiError(404,"No Like Found")
    }
    const formatedLikedVideos = likedVideos.map(likedVideo=>({
        ...likedVideo.toObject(),
        video:{
            ...likedVideo.video.toObject(),
            createdAt: formatDistanceToNowStrict(new Date(likedVideo.createdAt),{addSuffix: true})
        }
    }))
    res
    .status(200)
    .json(
        new ApiResponse(200,formatedLikedVideos,"Liked Videos Fetched Succesfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}