import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateCoverImage,
    updateUserAvatar
} from "../controllers/user.controller.js";

import { upload } from '../middlewares/multer.middlewares.js'
import { verifyJwt } from "../middlewares/auth.middlewares.js";


// file_handlig for image and avatar

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])

    , registerUser
);

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJwt, changeCurrentPassword)

router.route("/current-user").post(verifyJwt, getCurrentUser)

router.route("/update-details").patch(verifyJwt, updateAccountDetails)

router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateCoverImage)

router.route("/channel/:userName").get(verifyJwt, getUserChannelProfile);

router.route("/watch-history").get(verifyJwt, getWatchHistory);

export default router;