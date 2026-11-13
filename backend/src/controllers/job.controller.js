import prisma from "../db/prisma.js";

export const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            location,
            employmentType,
            salaryMin,
            salaryMax,
            skills
        } = req.body;

        // Validate salary range
        if (
            salaryMin !== undefined &&
            (!Number.isInteger(Number(salaryMin)) || Number(salaryMin) < 0)
        ) {
            return res.status(400).json({
                message: "Minimum salary must be a non-negative integer"
            });
        }

        if (
            salaryMax !== undefined &&
            (!Number.isInteger(Number(salaryMax)) || Number(salaryMax) < 0)
        ) {
            return res.status(400).json({
                message: "Maximum salary must be a non-negative integer"
            });
        }

        if (
            salaryMin !== undefined &&
            salaryMax !== undefined &&
            Number(salaryMin) > Number(salaryMax)
        ) {
            return res.status(400).json({
                message: "Minimum salary cannot exceed maximum salary"
            });
        }

        const job = await prisma.job.create({
            data: {
                title,
                description,
                location,
                employmentType,
                salaryMin,
                salaryMax,
                skills,
                recruiterId: req.user.id
            }
        });

        res.status(201).json({
            message: "Job created successfully",
            job
        });

    } catch (error) {
        console.error("Create job error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const getJobs = async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            jobs
        });

    } catch (error) {
        console.error("Get jobs error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.status(200).json({
            job
        });

    } catch (error) {
        console.error("Get job by ID error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            location,
            employmentType,
            salaryMin,
            salaryMax,
            skills

        } = req.body;

        const existingJob = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        if (!existingJob) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // Validate salary range during job update
        if (
            salaryMin !== undefined &&
            salaryMin !== null &&
            (!Number.isInteger(Number(salaryMin)) || Number(salaryMin) < 0)
        ) {
            return res.status(400).json({
                message: "Minimum salary must be a non-negative integer"
            });
        }

        if (
            salaryMax !== undefined &&
            salaryMax !== null &&
            (!Number.isInteger(Number(salaryMax)) || Number(salaryMax) < 0)
        ) {
            return res.status(400).json({
                message: "Maximum salary must be a non-negative integer"
            });
        }

        const finalSalaryMin = salaryMin !== undefined
            ? salaryMin
            : existingJob.salaryMin;

        const finalSalaryMax = salaryMax !== undefined
            ? salaryMax
            : existingJob.salaryMax;

        if (
            finalSalaryMin !== null &&
            finalSalaryMax !== null &&
            finalSalaryMin !== undefined &&
            finalSalaryMax !== undefined &&
            Number(finalSalaryMin) > Number(finalSalaryMax)
        ) {
            return res.status(400).json({
                message: "Minimum salary cannot exceed maximum salary"
            });
        }

        if (!existingJob) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (
            req.user.role !== "ADMIN" &&
            existingJob.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to update this job"
            });
        }

        const updatedJob = await prisma.job.update({
            where: {
                id: id
            },
            data: {
                title,
                description,
                location,
                employmentType,
                salaryMin: salaryMin === undefined ? undefined : salaryMin === null ? null : Number(salaryMin),
                salaryMax: salaryMax === undefined ? undefined : salaryMax === null ? null : Number(salaryMax),
                skills,
            }
        });

        res.status(200).json({
            message: "Job updated successfully",
            job: updatedJob
        });

    } catch (error) {
        console.error("Update job error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const publishJob = async (req, res) => {
    try {
        const { id } = req.params;

        const existingJob = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        if (!existingJob) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // Admin can manage any job.
        // Recruiter can manage only their own job.
        if (
            req.user.role !== "ADMIN" &&
            existingJob.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to publish this job"
            });
        }

        if (existingJob.status !== "DRAFT") {
            return res.status(400).json({
                message: "Only draft jobs can be published"
            });
        }

        // Atomically publish only a DRAFT job.
        const updateResult = await prisma.job.updateMany({
            where: {
                id: id,
                status: "DRAFT"
            },
            data: {
                status: "PUBLISHED"
            }
        });

        if (updateResult.count === 0) {
            return res.status(409).json({
                message: "Job was already updated by another request"
            });
        }

        const publishedJob = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        res.status(200).json({
            message: "Job published successfully",
            job: publishedJob
        });

    } catch (error) {
        console.error("Publish job error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const closeJob = async (req, res) => {
    try {
        const { id } = req.params;

        const existingJob = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        if (!existingJob) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (
            req.user.role !== "ADMIN" &&
            existingJob.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to close this job"
            });
        }

        if (existingJob.status !== "PUBLISHED") {
            return res.status(400).json({
                message: "Only published jobs can be closed"
            });
        }

        // Atomically close only a PUBLISHED job.
        const updateResult = await prisma.job.updateMany({
            where: {
                id: id,
                status: "PUBLISHED"
            },
            data: {
                status: "CLOSED"
            }
        });

        if (updateResult.count === 0) {
            return res.status(409).json({
                message: "Job was already updated by another request"
            });
        }

        const closedJob = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        res.status(200).json({
            message: "Job closed successfully",
            job: closedJob
        });

    } catch (error) {
        console.error("Close job error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const archiveJob = async (req, res) => {
    try {
        const { id } = req.params;

        const existingJob = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        if (!existingJob) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (
            req.user.role !== "ADMIN" &&
            existingJob.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to archive this job"
            });
        }

        if (existingJob.status !== "CLOSED") {
            return res.status(400).json({
                message: "Only closed jobs can be archived"
            });
        }

        // Atomically archive only a CLOSED job.
        const updateResult = await prisma.job.updateMany({
            where: {
                id: id,
                status: "CLOSED"
            },
            data: {
                status: "ARCHIVED"
            }
        });

        if (updateResult.count === 0) {
            return res.status(409).json({
                message: "Job was already updated by another request"
            });
        }

        const archivedJob = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        res.status(200).json({
            message: "Job archived successfully",
            job: archivedJob
        });

    } catch (error) {
        console.error("Archive job error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};