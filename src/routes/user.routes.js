import { Router } from "express";
import { registerUser} from "../controllers/users.controlller.js";

import {upload} from '../middlewares/multer.middlewares.js'


// file_handlig for image and avatar

const router =Router();

router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])

 ,   registerUser
);
export default router;