import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary , deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { 
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt", 
        sortType = "desc", 
    } = req.query
    const sortOrder= sortType=="asc"?1:-1;
    const pipeline = [];

    // Match stage for text search
    if (query) {
        pipeline.push({
            $match: {
            $text: { $search: query }
            }
        });
    }

    // Lookup stage to populate owner with 'username' and 'avatar' fields
    pipeline.push({
        $lookup: {
            from: "users", // Assuming the collection name for users is 'users'
            localField: "owner",
            foreignField: "_id",
            as: "owner"
        }
    });

    // Unwind the owner array to flatten the results
    pipeline.push({
        $unwind: {
            path: "$owner",
            preserveNullAndEmptyArrays: true // Optional: if you want to keep videos without owners
        }
    });

    // Project stage to include only the necessary fields
    pipeline.push({
        $project: {
            _id:1,
            thumbnail: 1,
            title:1,
            duration:1,
            views:1,
            "owner.username": 1,
            "owner.avatar": 1,
            // Include other fields you want to return from the Video collection
        }
    });

    // Sort stage
    pipeline.push({
        $sort: {
            [sortBy]: sortOrder
        }
    });

    // Skip and limit stage for pagination
    pipeline.push({
        $skip: (page - 1) * limit
    });

    pipeline.push({
        $limit: parseInt(limit, 10)
    });
    const allVideos = await Video.aggregate(pipeline)
    if (!allVideos?.length) {
        throw new ApiError(404, `No videos found for query: "${query}"`);
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, allVideos, "Videos fetched successfully")
    );
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(401,"Title and Description both are required to publish videos");
    }
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail file both are required to publish videos")
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);  
    if (!videoFile) {
        throw new ApiError(500, "Error occured while uploading the video")
    }
    
    if (!thumbnail) {
        throw new ApiError(500, "Error occured while uploading the thumbnail")
    }
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })

    // Return the created video object
    return res
    .status(201)
    .json(
        new ApiResponse(200, video, "Video uploaded successfully")
    );
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video ID")
    }
    const video = await Video.findById(videoId).select("-videoFile -isPublished")
    if (!video) {
        throw new ApiError(400,"Video Not Found")
    }
    if (video.owner!==req.user._id && video.isPublished==false) {
        throw new ApiError(401,"Video Is Either Not Published or Private")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Fetched The video Successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video ID")
    }
    const { title , description } = req.body
    if (!title || !description) {
        throw new ApiError(400,"Title and Description is required to update video details")
    }

    const thmbnailLocalPath = req?.file.path;
    if (!thmbnailLocalPath) {
        throw new ApiError(401,"Thumbnail is required to update")
    }
    const oldVideo = await Video.findById(videoId);
    if (!oldVideo) {
        throw new ApiError(404, "Video Not Found");
    }
    const oldThumbnailUrl = oldVideo.thumbnail;

    // Delete old avatar from Cloudinary if it exists
    if (oldThumbnailUrl) {
            await deleteFromCloudinary(oldThumbnailUrl); // Ensure this function is implemented
    }
    const thumbnail = uploadOnCloudinary(thmbnailLocalPath);
    if (!thumbnail) {
        throw new ApiError(400,"Error while uploading Thumbnail")
    }

    const video = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user?._id
        },
        {
            $set:{
                thumbnail: thumbnail.url,
                title,
                description
            }
        },
        {new:true}
    ).select("-videoFile -isPublished")
    if (!video) {
        throw new ApiError(400,"Video Not Found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video ,"Video details updated successfully")
    )
    
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video ID")
    }
    const deletedVideo = await Video.deleteOne({_id:videoId,owner: req.user?._id});
    if (!deletedVideo) {
        throw new ApiError(404, "Video not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,[], "Video Deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video ID")
    }
    const video = await Video.findOne(
        { 
            _id: videoId,
            owner: req.user._id
        })
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    video.isPublished = !video.isPublished;
    const savedVideo = await video.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(
        new ApiResponse(200,savedVideo,"Publish Status Toggled")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
