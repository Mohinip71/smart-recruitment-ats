import express from "express";

import { getDashboardAnalytics } from "../controllers/analytics.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/dashboard",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    getDashboardAnalytics
);

export default router;