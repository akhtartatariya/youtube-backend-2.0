import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller";

const router=Router()

router.use(verifyJWT)

router.route('/').post(createTweet)

router.route('/:id').patch(updateTweet).delete(deleteTweet)
router.route('/user/:id').get(getUserTweets)

export default router