import prisma from "../db/prisma.js";

export const createInterview = async (req, res) => {
    try {
        const {
            applicationId,
            scheduledAt,
            type,
            meetingLink,
            location,
            notes
        } = req.body;

        // 1. Required fields
        if (!applicationId || !scheduledAt || !type) {
            return res.status(400).json({
                message: "Application ID, scheduled time and interview type are required"
            });
        }

        // 2. Validate interview type
        const validTypes = ["ONLINE", "IN_PERSON"];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid interview type"
            });
        }

        // 3. Find application
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: true
            }
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        // 4. Only job owner or admin can schedule interview
        if (
            req.user.role !== "ADMIN" &&
            application.job.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to schedule an interview for this application"
            });
        }

        // 5. Online interview should have meeting link
        if (type === "ONLINE" && !meetingLink) {
            return res.status(400).json({
                message: "Meeting link is required for online interviews"
            });
        }

        // 6. In-person interview should have location
        if (type === "IN_PERSON" && !location) {
            return res.status(400).json({
                message: "Location is required for in-person interviews"
            });
        }

        // 7. Create interview
        const interview = await prisma.interview.create({
            data: {
                applicationId,
                scheduledAt: new Date(scheduledAt),
                type,
                meetingLink,
                location,
                notes
            }
        });

        res.status(201).json({
            message: "Interview scheduled successfully",
            interview
        });

    } catch (error) {
        console.error("Create interview error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await prisma.interview.findMany({
            where: {
                application: {
                    candidateId: req.user.id
                }
            },
            include: {
                application: {
                    include: {
                        job: {
                            select: {
                                id: true,
                                title: true,
                                location: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                scheduledAt: "asc"
            }
        });

        res.status(200).json({
            interviews
        });
    } catch (error) {
        console.error("Get my interviews error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};