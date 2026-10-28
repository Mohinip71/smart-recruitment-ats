import express from "express";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import offerRoutes from "./routes/offer.routes.js";

    

const app=express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/offers", offerRoutes);

app.get("/",(req,res) =>{
    res.json({
        message: "Smart ATS backend is running"
    })
})

export default app;
