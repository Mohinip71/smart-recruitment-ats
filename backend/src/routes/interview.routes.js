import express from "express";

import { createInterview,getMyInterviews,getInterviewsByJob,updateInterviewStatus} from "../controllers/interview.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    createInterview
);
router.get(
    "/my",
    authenticate,
    authorize("CANDIDATE"),
    getMyInterviews
);
router.get(
    "/job/:jobId",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    getInterviewsByJob
);
router.patch(
    "/:interviewId/status",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    updateInterviewStatus
);
export default router;