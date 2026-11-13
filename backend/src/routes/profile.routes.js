import express from "express";

import {
    getMyProfile,
    createOrUpdateProfile,
    uploadMyResume,
    uploadMyProfilePhoto,
    downloadMyResume
} from "../controllers/profile.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import {
    uploadResume,
    uploadProfilePhoto
} from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("CANDIDATE"));

router.get("/me", getMyProfile);

router.put("/me", createOrUpdateProfile);

router.post("/me/resume", uploadResume, uploadMyResume);

router.post("/me/photo", uploadProfilePhoto, uploadMyProfilePhoto);

router.get("/me/resume/download", downloadMyResume);

export default router;