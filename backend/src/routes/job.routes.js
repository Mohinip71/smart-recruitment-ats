import express from "express";
import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    publishJob,
    closeJob,
    archiveJob
} from "../controllers/job.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    createJob
);

router.get("/", getJobs);

router.patch(
    "/:id/publish",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    publishJob
);

router.patch(
    "/:id/close",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    closeJob
);

router.patch(
    "/:id/archive",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    archiveJob
);

router.get("/:id", getJobById);

router.post(
    "/",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    createJob
);

router.patch(
    "/:id",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    updateJob
);


export default router;