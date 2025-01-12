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
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(401,"User unauthorized")
    }
    const playlist =await Playlist.create({
        name,
        description,
        owner: user
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
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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
