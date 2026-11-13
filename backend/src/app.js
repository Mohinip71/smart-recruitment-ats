import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());

// Request body limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(cookieParser());

// Authentication rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts. Please try again later."
    }
});

app.use("/api/auth", authLimiter, authRoutes);

// API routes
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Smart ATS backend is running"
    });
});

// Global error handler — must be last
app.use(errorHandler);

export default app;