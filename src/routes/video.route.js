import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()


router.use(verifyJWT)
router.route('/').get(getAllVideos).post(upload.fields(
    [
        { name: 'videoFile', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]
), publishVideo)

router.route('/:videoId').patch(updateVideo).delete(deleteVideo)

router.route('/toggle/publish').get(togglePublishStatus)

export default router