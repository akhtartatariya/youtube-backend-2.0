import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router=Router()

router.use(verifyJWT)

router.route('/').post(createPlaylist)
router.route('/:playlistId').patch(updatePlaylist).delete(deletePlaylist).get(getPlaylistById)
router.route('/add-video/:videoId/:playlistId').patch(addVideoPlaylist,)
router.route('/remove-video/:videoId/:playlistId').patch(removeVideoFromPlaylist)
router.route('/user/:userId').get(getUserPlaylists)

export default router