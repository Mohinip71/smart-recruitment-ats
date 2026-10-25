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

        if (!title || !description || !employmentType) {
            return res.status(400).json({
                message: "Title, description and employment type are required"
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
                salaryMin,
                salaryMax,
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

        const publishedJob = await prisma.job.update({
            where: {
                id: id
            },
            data: {
                status: "PUBLISHED"
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

        const closedJob = await prisma.job.update({
            where: {
                id: id
            },
            data: {
                status: "CLOSED"
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

        const archivedJob = await prisma.job.update({
            where: {
                id: id
            },
            data: {
                status: "ARCHIVED"
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