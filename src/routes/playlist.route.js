import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addVideoPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller";

const router=Router()

router.use(verifyJWT)

router.route('/').post(createPlaylist)
router.route('/:id').patch(updatePlaylist).delete(deletePlaylist).get(getPlaylistById)
router.route('/playlist/:vid/:pid').patch(addVideoPlaylist,).patch(removeVideoFromPlaylist)
router.route('/user-playlist/:uid').get(getUserPlaylists)

export default router