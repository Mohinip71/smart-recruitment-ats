import prisma from "../db/prisma.js";

export const getMyProfile = async (req, res) => {
    try {
        const profile = await prisma.candidateProfile.findUnique({
            where: {
                userId: req.user.id
            }
        });

        if (!profile) {
            return res.status(404).json({
                message: "Candidate profile not found"
            });
        }

        res.status(200).json({
            profile
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};


export const createOrUpdateProfile = async (req, res) => {
    try {
        const {
            phone,
            location,
            bio,
            skills,
            resumeUrl
        } = req.body;

        const profile = await prisma.candidateProfile.upsert({
            where: {
                userId: req.user.id
            },

            update: {
                phone,
                location,
                bio,
                skills,
                resumeUrl
            },

            create: {
                userId: req.user.id,
                phone,
                location,
                bio,
                skills,
                resumeUrl
            }
        });

        res.status(200).json({
            message: "Profile saved successfully",
            profile
        });

    } catch (error) {
        console.error("Save profile error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};