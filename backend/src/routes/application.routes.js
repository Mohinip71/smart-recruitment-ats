import express from "express";

import {
    createApplication,
    getApplicationsByJob,
    updateApplicationStatus,
    getMyApplications
} from "../controllers/application.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// Candidate → Apply for a job
router.post(
    "/",
    authenticate,
    authorize("CANDIDATE"),
    createApplication
);


// Candidate → View own applications
router.get(
    "/my",
    authenticate,
    authorize("CANDIDATE"),
    getMyApplications
);


// Recruiter/Admin → View applications of a job
router.get(
    "/job/:jobId",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    getApplicationsByJob
);


// Recruiter/Admin → Update application status
router.patch(
    "/:applicationId/status",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    updateApplicationStatus
);


export default router;