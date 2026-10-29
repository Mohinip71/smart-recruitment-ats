import prisma from "../db/prisma.js";

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
        if (!applicationId || !salary || !joiningDate) {
            return res.status(400).json({
                message: "Application ID, salary and joining date are required"
            });
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
                salary: Number(salary),
                joiningDate: new Date(joiningDate),
                expiryDate: expiryDate
                    ? new Date(expiryDate)
                    : null,
                notes
            }
        });

        res.status(201).json({
            message: "Offer created successfully",
            offer
        });

    } catch (error) {
        console.error("Create offer error:", error);

        res.status(500).json({
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