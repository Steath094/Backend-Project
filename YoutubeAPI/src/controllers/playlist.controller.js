import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (name.trim()==="" || description.trim()==="") {
        throw new ApiError(400,"Name and Description Both are required to make Playlist")
    }
    const userId = req.user?._id;
    const playlist =await Playlist.create({
        name,
        description,
        owner: userId
    })

    if (!playlist) {
        throw new ApiError(500, "Something went wrong while creating the playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, tweet, "Playlist created Successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if (!userId) {
        throw new ApiError(400,"UserId is required while for searching for user playlist,Bad Request")
    }
    const loginUserId = req.user?._id;
    if (userId!==loginUserId) {
        throw new ApiError("Unauthorized Request");
    }
    const playlist = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "playlists",
                localField: "_id",
                foreignField: "owner",
                as: "playlists"
            }
        },{
            $addFields: {
                tweets: {
                    $first: "$playlists"
                }
            }
        },{
            $project:{
                playlists: 1
            }
        }
    ])
    if(!playlist?.length){
        throw new ApiError(400,"Playlists does not exist");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist,"User's Playlists fetched Successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!playlistId) {
        throw new ApiError(400,"Playlist is required");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400,"No such Playlist exist with this  PlaylistID");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist fetched successfully bu PlaylistID")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(400,"PlaylistId and videoId is required to add video into playlist");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400,"No such Playlist exist with this  PlaylistID");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400,"Video does not exist");
    }
    playlist.videos.push(videoId);
    await playlist.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Video added to playlist Successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!playlistId || !videoId) {
        throw new ApiError(400,"PlaylistId and videoId is required to Remove video from playlist");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400,"No such Playlist exist with this PlaylistID");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400,"Video does not exist");
    }
    playlist.videos =  playlist.videos.filter(id=> id!==videoId);
    await playlist.save();
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Video removed from playlist Successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params
    if (!playlistId) {
        throw new ApiError(400,"PlaylistId is required to Remove playlist");
    }
    const userId = req.user?._id
    if (userId) {
        throw new ApiError(401,"Unauthorized Request,user is required to remove Playlist");
    }
    
    const result = await Playlist.deleteOne({_id:playlistId,owner: userId})
            if (result.deletedCount === 0) {
                return res.status(404).json(new ApiResponse(404, null, "Playlist not found or not authorized"));
            }
            return res
            .status(200)
            .json(
                new ApiResponse(200,[],"Playlist Deleted Succesfully")
            )
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Failed to delete Playlist"));
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    const userId = req.user?.id;
    //TODO: update playlist
    if (!playlistId) {
        throw new ApiError(400,"PlaylistId is required to update playlist");
    }
    if (name.trim()==="" || description.trim()==="") {
        throw new ApiError(400,"Name and Description Both are required to update Playlist")
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400,"No such Playlist exist with this PlaylistID");
    }
    if(playlist.owner!==userId){
        throw new ApiError(401,"Unauthorized Request access")
    }
    playlist.name = name
    playlist.description = description
    await playlist.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist updated Successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
