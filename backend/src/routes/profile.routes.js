import express from "express";

import {
    getMyProfile,
    createOrUpdateProfile
} from "../controllers/profile.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/me",
    authenticate,
    authorize("CANDIDATE"),
    getMyProfile
);

router.put(
    "/me",
    authenticate,
    authorize("CANDIDATE"),
    createOrUpdateProfile
);

export default router;