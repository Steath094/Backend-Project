import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: {
                path: '$ownerDetails',
                preserveNullAndEmptyArrays: true // Optional: if you want to keep comments without owners
            }
        },
        {
            $project: {
                content: 1, // Include the content of the comment
                createdAt: 1, // Include the createdAt timestamp
                updatedAt: 1, // Include the updatedAt timestamp
                'ownerDetails.username': 1, // Include the owner's username
                'ownerDetails.avatar': 1 // Include the owner's avatar
            }
        },
        {
            $sort: { createdAt: -1 } // Sort comments by creation date, newest first
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit, 10)
        }
    ])
    if (!comments.length) {
        throw new ApiError(400, "Comments Not Found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,comments,"Comments Fetched Succesfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }
    const content = req.body.content;
    if (content.trim()=="") {
        throw new ApiError(401,"Content is Reqired to Create Comment")
    } 
    const userId = req.user._id;
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })
    if (!comment) {
        throw new ApiError(500,"Error occured While Commenting");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment Uploaded Successful")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    console.log(commentId);
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }
    const toUpdatecontent = req.body.content;
    if (toUpdatecontent.trim()=="") {
        throw new ApiError(401,"Content is Reqired to Update Comment")
    } 
    const userId = req.user._id;
    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: userId
        },{
            $set:{
                content: toUpdatecontent
            }
        }
    )
    if (!updatedComment) {
        throw new ApiError(500,"Error occured While Updating Comment");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedComment,"Comment Updated Succesfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId }= req.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }
    const userId = req.user._id;
    console.log(userId.toString());
    
    const result = await Comment.deleteOne({_id:commentId,owner: userId});
    if (result.deletedCount === 0) {
        throw new ApiError(400,"Comment not found or you do not have permission to delete it")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,[],"Comment Deleted Succesfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
