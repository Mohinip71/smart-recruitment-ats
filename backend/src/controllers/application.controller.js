import prisma from "../db/prisma.js";

export const createApplication = async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required"
            });
        }

        const job = await prisma.job.findUnique({
            where: {
                id: jobId
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (job.status !== "PUBLISHED") {
            return res.status(400).json({
                message: "You can only apply to published jobs"
            });
        }

        const existingApplication = await prisma.application.findUnique({
            where: {
                candidateId_jobId: {
                    candidateId: req.user.id,
                    jobId: jobId
                }
            }
        });

        if (existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job"
            });
        }

        const application = await prisma.application.create({
            data: {
                candidateId: req.user.id,
                jobId: jobId
            }
        });

        res.status(201).json({
            message: "Application submitted successfully",
            application
        });

    } catch (error) {
        console.error("Create application error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const getApplicationsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await prisma.job.findUnique({
            where: {
                id: jobId
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (
            req.user.role !== "ADMIN" &&
            job.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to view applications for this job"
            });
        }

        const applications = await prisma.application.findMany({
            where: {
                jobId: jobId
            },
            include: {
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            job: {
                id: job.id,
                title: job.title
            },
            applications
        });

    } catch (error) {
        console.error("Get applications error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Application status is required"
            });
        }

        const application = await prisma.application.findUnique({
            where: {
                id: applicationId
            },
            include: {
                job: true
            }
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        if (
            req.user.role !== "ADMIN" &&
            application.job.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to update this application"
            });
        }

        const validStatuses = [
            "APPLIED",
            "SCREENING",
            "SHORTLISTED",
            "INTERVIEW",
            "SELECTED",
            "REJECTED"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status"
            });
        }

        const allowedTransitions = {
            APPLIED: ["SCREENING", "REJECTED"],
            SCREENING: ["SHORTLISTED", "REJECTED"],
            SHORTLISTED: ["INTERVIEW", "REJECTED"],
            INTERVIEW: ["SELECTED", "REJECTED"],
            SELECTED: [],
            REJECTED: []
        };

        if (!allowedTransitions[application.status].includes(status)) {
            return res.status(400).json({
                message: `Invalid status transition from ${application.status} to ${status}`
            });
        }

        const updatedApplication = await prisma.application.update({
            where: {
                id: applicationId
            },
            data: {
                status
            }
        });

        res.status(200).json({
            message: "Application status updated successfully",
            application: updatedApplication
        });

    } catch (error) {
        console.error("Update application status error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: {
                candidateId: req.user.id
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        employmentType: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            applications
        });

    } catch (error) {
        console.error("Get my applications error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};