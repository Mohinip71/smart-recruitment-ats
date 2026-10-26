import express from "express";

import { createInterview } from "../controllers/interview.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    createInterview
);

export default router;