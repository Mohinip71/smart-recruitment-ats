import prisma from "../db/prisma.js";
import { createNotification } from "../services/notification.service.js";

export const createOffer = async (req, res) => {
    try {
        const {
            applicationId,
            salary,
            joiningDate,
            expiryDate,
            notes
        } = req.body;

        // 1. Required fields
        // 1. Required fields
        if (!applicationId || salary === undefined || salary === null || !joiningDate) {
            return res.status(400).json({
                message: "Application ID, salary and joining date are required"
            });
        }

        // Salary must be a positive integer.
        const salaryValue = Number(salary);

        if (!Number.isSafeInteger(salaryValue) || salaryValue <= 0) {
            return res.status(400).json({
                message: "Salary must be a positive integer"
            });
        }

        // Validate joining date.
        const joiningDateValue = new Date(joiningDate);

        if (Number.isNaN(joiningDateValue.getTime())) {
            return res.status(400).json({
                message: "Invalid joining date"
            });
        }

        // Validate expiry date if provided.
        let expiryDateValue = null;

        if (expiryDate) {
            expiryDateValue = new Date(expiryDate);

            if (Number.isNaN(expiryDateValue.getTime())) {
                return res.status(400).json({
                    message: "Invalid expiry date"
                });
            }

            if (expiryDateValue <= new Date()) {
                return res.status(400).json({
                    message: "Expiry date must be in the future"
                });
            }

            if (expiryDateValue >= joiningDateValue) {
                return res.status(400).json({
                    message: "Offer expiry date must be before joining date"
                });
            }
        }



        // 2. Find application
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: true,
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        // Only the job owner or ADMIN can create an offer.
        if (
            req.user.role !== "ADMIN" &&
            application.job.recruiterId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to create an offer for this application"
            });
        }



        // 3. Only selected candidates can receive an offer
        if (application.status !== "SELECTED") {
            return res.status(400).json({
                message: "Offer can only be created for a selected candidate"
            });
        }

        // 4. Check whether offer already exists
        const existingOffer = await prisma.offer.findUnique({
            where: {
                applicationId: applicationId
            }
        });

        if (existingOffer) {
            return res.status(409).json({
                message: "Offer already exists for this application"
            });
        }

        // 5. Create offer
        const offer = await prisma.offer.create({
            data: {
                applicationId,
                salary: salaryValue,
                joiningDate: joiningDateValue,
                expiryDate: expiryDateValue,
                notes
            }
        });

        // Notify candidate about the new offer.
        try {
            await createNotification({
                userId: application.candidateId,
                type: "OFFER_RECEIVED",
                title: "New Job Offer Received",
                message: `Congratulations! You have received an offer for ${application.job.title}.`
            });
        } catch (notificationError) {
            console.error(
                "Offer created, but notification failed:",
                notificationError
            );
        }

        res.status(201).json({
            message: "Offer created successfully",
            offer
        });

    } catch (error) {
        console.error("Create offer error:", error);

        // Handle duplicate offer creation.
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "An offer has already been created for this application"
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const getMyOffers = async (req, res) => {
    try {
        const offers = await prisma.offer.findMany({
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
                                location: true,
                                employmentType: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            offers
        });

    } catch (error) {
        console.error("Get my offers error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const updateOfferStatus = async (req, res) => {
    try {
        const { offerId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Offer status is required"
            });
        }

        const offer = await prisma.offer.findUnique({
            where: {
                id: offerId
            },
            include: {
                application: true
            }
        });

        if (!offer) {
            return res.status(404).json({
                message: "Offer not found"
            });
        }

        // Candidate can update only their own offer
        if (offer.application.candidateId !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to update this offer"
            });
        }

        // Candidate can only ACCEPT or REJECT
        const validStatuses = ["ACCEPTED", "REJECTED"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid offer status"
            });
        }

        // Offer must still be pending
        if (offer.status !== "PENDING") {
            return res.status(400).json({
                message: `Offer is already ${offer.status}`
            });
        }

        // Check whether the offer has expired
        if (
            offer.expiryDate &&
            new Date() > new Date(offer.expiryDate)
        ) {
            return res.status(400).json({
                message: "This offer has expired and can no longer be accepted or rejected"
            });
        }

        const result = await prisma.$transaction(async (tx) => {

            // Atomically update only if the offer is still PENDING.
            const updated = await tx.offer.updateMany({
                where: {
                    id: offerId,
                    status: "PENDING"
                },
                data: {
                    status
                }
            });

            // Another request may have already updated the offer.
            if (updated.count === 0) {
                return null;
            }

            const updatedOffer = await tx.offer.findUnique({
                where: {
                    id: offerId
                }
            });

            let onboarding = null;

            // Create onboarding only when the offer is accepted.
            if (status === "ACCEPTED") {
                onboarding = await tx.onboarding.create({
                    data: {
                        offerId: offer.id,
                        status: "INITIATED",
                        joiningDate: offer.joiningDate
                    }
                });
            }

            return {
                updatedOffer,
                onboarding
            };
        });

        // Handle concurrent update conflict.
        if (!result) {
            return res.status(409).json({
                message: "Offer has already been processed by another request"
            });
        }




        try {
            await createNotification({
                userId: req.user.id,
                type: status === "ACCEPTED"
                    ? "OFFER_ACCEPTED"
                    : "OFFER_REJECTED",
                title: `Offer ${status.toLowerCase()}`,
                message: `Your offer has been ${status.toLowerCase()} successfully.`
            });
        } catch (notificationError) {
            console.error(
                "Offer status updated, but notification failed:",
                notificationError
            );
        }

        res.status(200).json({
            message: `Offer ${status.toLowerCase()} successfully`,
            offer: result.updatedOffer,
            onboarding: result.onboarding
        });

    } catch (error) {
        console.error("Update offer status error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};