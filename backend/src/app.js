import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
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
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const app = express();

// CORS — allow the React dev server to call the API with cookies
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map(o => o.trim());

app.use(
    cors({
        origin(origin, cb) {
            // allow REST tools / server-to-server without an Origin header
            if (!origin || allowedOrigins.includes(origin)) {
                return cb(null, true);
            }
            return cb(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true
    })
);

// Security headers — relax the bits that break cross-origin API + cookies
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginOpenerPolicy: false,
        contentSecurityPolicy: false
    })
);

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

// In production, serve the built React app from the same origin so the
// httpOnly auth cookie is same-site (avoids cross-origin cookie/CORS issues).
// Requires the frontend to be built (`npm run build` in frontend/) before deploy.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuild = path.resolve(__dirname, "../../frontend/build");

if (process.env.NODE_ENV === "production" && fs.existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    // SPA fallback: any non-API GET request returns index.html (React Router)
    app.use((req, res, next) => {
        if (req.method === "GET" && !req.path.startsWith("/api")) {
            return res.sendFile(path.join(clientBuild, "index.html"));
        }
        next();
    });
} else {
    app.get("/", (req, res) => {
        res.status(200).json({ message: "Smart ATS backend is running" });
    });
}

// Global error handler — must be last
app.use(errorHandler);

export default app;