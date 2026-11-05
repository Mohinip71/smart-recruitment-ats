import prisma from "../db/prisma.js";

// Get logged-in candidate's onboarding
export const getMyOnboarding = async (req, res) => {
    try {
        const onboarding = await prisma.onboarding.findFirst({
            where: {
                offer: {
                    application: {
                        candidateId: req.user.id
                    }
                }
            },
            include: {
                offer: {
                    include: {
                        application: {
                            include: {
                                job: {
                                    select: {
                                        id: true,
                                        title: true,
                                        location: true,
                                        employmentType: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!onboarding) {
            return res.status(404).json({
                message: "Onboarding not found"
            });
        }

        res.status(200).json({
            onboarding
        });

    } catch (error) {
        console.error("Get my onboarding error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};


// Get onboarding by offer ID
// Recruiter/Admin can use this
export const getOnboardingByOffer = async (req, res) => {
    try {
        const { offerId } = req.params;

        const onboarding = await prisma.onboarding.findUnique({
            where: {
                offerId
            },
            include: {
                offer: {
                    include: {
                        application: {
                            include: {
                                candidate: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                },
                                job: {
                                    select: {
                                        id: true,
                                        title: true,
                                        recruiterId: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!onboarding) {
            return res.status(404).json({
                message: "Onboarding not found"
            });
        }

        // Admin can access any onboarding
        if (
            req.user.role !== "ADMIN" &&
            onboarding.offer.application.job.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to view this onboarding"
            });
        }

        res.status(200).json({
            onboarding
        });

    } catch (error) {
        console.error("Get onboarding error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};


// Update onboarding status
export const updateOnboardingStatus = async (req, res) => {
    try {
        const { onboardingId } = req.params;
        const { status, joiningDate, notes } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Onboarding status is required"
            });
        }

        const validStatuses = [
            "INITIATED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid onboarding status"
            });
        }

        const onboarding = await prisma.onboarding.findUnique({
            where: {
                id: onboardingId
            },
            include: {
                offer: {
                    include: {
                        application: {
                            include: {
                                job: true
                            }
                        }
                    }
                }
            }
        });

        if (!onboarding) {
            return res.status(404).json({
                message: "Onboarding not found"
            });
        }

        // Security check:
        // Only the recruiter who owns the job or ADMIN can update it
        if (
            req.user.role !== "ADMIN" &&
            onboarding.offer.application.job.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to update this onboarding"
            });
        }

        const updatedOnboarding = await prisma.onboarding.update({
            where: {
                id: onboardingId
            },
            data: {
                status,
                joiningDate: joiningDate
                    ? new Date(joiningDate)
                    : undefined,
                notes
            }
        });

        res.status(200).json({
            message: "Onboarding updated successfully",
            onboarding: updatedOnboarding
        });

    } catch (error) {
        console.error("Update onboarding error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};