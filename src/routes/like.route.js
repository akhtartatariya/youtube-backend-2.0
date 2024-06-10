import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller";

const router=Router()

router.use(verifyJWT)
router.route('toggle-video-like/:vid').patch(toggleVideoLike)
router.route('toggle-comment-like/:cid').patch(toggleCommentLike)
router.route('toggle-tweet-like/:tid').patch(toggleTweetLike)
router.route('get-liked-videos').get(getLikedVideos)
export default router