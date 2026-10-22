import express from "express";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

    

const app=express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/",(req,res) =>{
    res.json({
        message: "Smart ATS backend is running"
    })
})

export default app;
