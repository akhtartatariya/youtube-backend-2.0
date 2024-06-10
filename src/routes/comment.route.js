import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller";

const router=Router()
router.use(verifyJWT)
router.route('/').post(addComment)
router.route('/:id').patch(updateComment).delete(deleteComment)
router.route('/video/:vid').get(getVideoComments)
export default router