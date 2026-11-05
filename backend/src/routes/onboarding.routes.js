import express from "express";

import {
    getMyOnboarding,
    getOnboardingByOffer,
    updateOnboardingStatus
} from "../controllers/onboarding.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// Candidate: View own onboarding
router.get(
    "/my",
    authenticate,
    authorize("CANDIDATE"),
    getMyOnboarding
);


// Recruiter/Admin: View onboarding by offer
router.get(
    "/offer/:offerId",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    getOnboardingByOffer
);


// Recruiter/Admin: Update onboarding
router.patch(
    "/:onboardingId/status",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    updateOnboardingStatus
);


export default router;