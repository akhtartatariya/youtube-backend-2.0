import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router()
router.use(verifyJWT)
router.route('/:videoId').post(addComment)
router.route('/:commentId').patch(updateComment).delete(deleteComment)
router.route('/video/:videoId').get(getVideoComments)
export default router