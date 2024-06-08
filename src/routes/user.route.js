import { Router } from "express";
import { loginUser, registerUser, logoutUser, getCurrentUser, refreshAccessToken, updateAvatarImage, updateCoverImage, updateUserDetails, changePassword, getUserProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route('/register').post(
    upload.fields(
        [
            { name: 'avatar', maxCount: 1 },
            { name: 'coverImage', maxCount: 1 }
        ]
    ),
    registerUser
)
router.route('/login').post(loginUser)


//protected routes
router.route('/logout').get(verifyJWT, logoutUser)
router.route('/get-user').get(verifyJWT, getCurrentUser)
router.route('/refresh-token').post(verifyJWT, refreshAccessToken)
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatarImage)
router.route('/update-cover-image').patch(verifyJWT, upload.single('coverImage'), updateCoverImage)
router.route('/update-user-details').patch(verifyJWT, updateUserDetails)
router.route('/update-password').patch(verifyJWT, changePassword)
router.route('/get-user-channel/:username').get(verifyJWT, getUserProfile)
router.route('/get-watch-history').get(verifyJWT, getWatchHistory)
export default router