import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscribers, getSubscribedChannels, toggleSubscription } from "../controllers/subscription.controller.js";

const router=Router()

router.use(verifyJWT)

router.route('/toggle/:channelId').patch(toggleSubscription)
router.route('/channel/:channelId').get(getChannelSubscribers)
router.route('/subscribed/:subscriberId').get(getSubscribedChannels)
export default router