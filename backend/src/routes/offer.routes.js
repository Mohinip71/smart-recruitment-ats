import express from "express";

import { createOffer,getMyOffers } from "../controllers/offer.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("RECRUITER", "ADMIN"),
    createOffer
);

router.get(
    "/my",
    authenticate,
    authorize("CANDIDATE"),
    getMyOffers
);

export default router;