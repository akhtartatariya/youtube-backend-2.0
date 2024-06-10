import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscribers, getSubscribedChannels, toggleSubscription } from "../controllers/subscription.controller.js";

const router=Router()

router.use(verifyJWT)

router.route('/toggle/:id').patch(toggleSubscription)
router.route('/channel/:id').get(getChannelSubscribers)
router.route('/subscribed/:id').get(getSubscribedChannels)
export default router