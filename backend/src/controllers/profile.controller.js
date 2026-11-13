import prisma from "../db/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import { randomUUID } from "crypto";

const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        Readable.from([buffer]).pipe(stream);
    });
};

const deleteCloudinaryAsset = async (
    publicId,
    resourceType,
    type = "upload"
) => {
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            type
        });
    } catch (error) {
        console.error("Cloudinary deletion error:", error);
    }
};

// GET MY PROFILE
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

        const {
            resumePublicId,
            resumeFormat,
            ...safeProfile
        } = profile;

        return res.status(200).json({
            message: "Profile fetched successfully",
            profile: safeProfile
        });

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

// CREATE OR UPDATE PROFILE
export const createOrUpdateProfile = async (req, res) => {
    try {
        const { phone, location, bio, skills } = req.body;

        const fields = { phone, location, bio, skills };
        const normalizedData = {};

        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined) {
                if (value !== null && typeof value !== "string") {
                    return res.status(400).json({
                        message: `${key} must be a string`
                    });
                }

                normalizedData[key] =
                    value === null || value.trim() === ""
                        ? null
                        : value.trim();
            }
        }

        if (
            normalizedData.phone &&
            !/^[+]?[0-9\s()-]{7,20}$/.test(normalizedData.phone)
        ) {
            return res.status(400).json({
                message: "Please provide a valid phone number"
            });
        }

        const profile = await prisma.candidateProfile.upsert({
            where: {
                userId: req.user.id
            },
            update: normalizedData,
            create: {
                userId: req.user.id,
                ...normalizedData
            }
        });

        return res.status(200).json({
            message: "Profile saved successfully",
            profile
        });

    } catch (error) {
        console.error("Save profile error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

// UPLOAD RESUME
export const uploadMyResume = async (req, res) => {
    let uploadedAsset;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a PDF resume"
            });
        }

        // Basic PDF signature validation
        if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
            return res.status(400).json({
                message: "Invalid PDF file"
            });
        }

        const oldProfile = await prisma.candidateProfile.findUnique({
            where: { userId: req.user.id }
        });

        uploadedAsset = await uploadToCloudinary(req.file.buffer, {
            resource_type: "raw",
            type: "authenticated",
            public_id: `smart-ats/resumes/${req.user.id}/${randomUUID()}.pdf`,
            overwrite: false
        });

        const profile = await prisma.candidateProfile.upsert({
            where: {
                userId: req.user.id
            },
            update: {
                resumePublicId: uploadedAsset.public_id,
                resumeFormat: uploadedAsset.format || "pdf",
                resumeOriginalName: req.file.originalname,
                resumeUrl: null
            },
            create: {
                userId: req.user.id,
                resumePublicId: uploadedAsset.public_id,
                resumeFormat: uploadedAsset.format || "pdf",
                resumeOriginalName: req.file.originalname
            }
        });

        // Delete previous resume only after DB update succeeds.
        if (
            oldProfile?.resumePublicId &&
            oldProfile.resumePublicId !== uploadedAsset.public_id
        ) {
            await deleteCloudinaryAsset(
                oldProfile.resumePublicId,
                "raw",
                "authenticated"
            );
        }

        return res.status(200).json({
            message: "Resume uploaded successfully",
            resumeOriginalName: profile.resumeOriginalName
        });

    } catch (error) {
        console.error("Resume upload error:", error);

        if (uploadedAsset?.public_id) {
            await deleteCloudinaryAsset(
                uploadedAsset.public_id,
                "raw",
                "authenticated"
            );
        }

        return res.status(500).json({
            message: "Resume upload failed"
        });
    }
};

// UPLOAD PROFILE PHOTO
export const uploadMyProfilePhoto = async (req, res) => {
    let uploadedAsset;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a profile photo"
            });
        }

        const oldProfile = await prisma.candidateProfile.findUnique({
            where: { userId: req.user.id }
        });

        uploadedAsset = await uploadToCloudinary(req.file.buffer, {
            resource_type: "image",
            type: "upload",
            folder: "smart-ats/profile-photos",
            public_id: `${req.user.id}-${randomUUID()}`,
            overwrite: false
        });

        const profile = await prisma.candidateProfile.upsert({
            where: {
                userId: req.user.id
            },
            update: {
                profilePhotoUrl: uploadedAsset.secure_url,
                profilePhotoPublicId: uploadedAsset.public_id
            },
            create: {
                userId: req.user.id,
                profilePhotoUrl: uploadedAsset.secure_url,
                profilePhotoPublicId: uploadedAsset.public_id
            }
        });

        if (
            oldProfile?.profilePhotoPublicId &&
            oldProfile.profilePhotoPublicId !== uploadedAsset.public_id
        ) {
            await deleteCloudinaryAsset(
                oldProfile.profilePhotoPublicId,
                "image",
                "upload"
            );
        }

        return res.status(200).json({
            message: "Profile photo uploaded successfully",
            profilePhotoUrl: profile.profilePhotoUrl
        });

    } catch (error) {
        console.error("Profile photo upload error:", error);

        if (uploadedAsset?.public_id) {
            await deleteCloudinaryAsset(
                uploadedAsset.public_id,
                "image",
                "upload"
            );
        }

        return res.status(500).json({
            message: "Profile photo upload failed"
        });
    }
};

// GENERATE SECURE RESUME DOWNLOAD LINK
export const downloadMyResume = async (req, res) => {
    try {
        const profile = await prisma.candidateProfile.findUnique({
            where: {
                userId: req.user.id
            },
            select: {
                resumePublicId: true,
                resumeFormat: true,
                resumeOriginalName: true
            }
        });

        if (!profile?.resumePublicId) {
            return res.status(404).json({
                message: "Resume not found"
            });
        }

        const downloadUrl = cloudinary.utils.private_download_url(
            profile.resumePublicId,
            profile.resumeFormat || "pdf",
            {
                resource_type: "raw",
                type: "authenticated",
                expires_at: Math.floor(Date.now() / 1000) + 60,
                attachment: true
            }
        );

        return res.status(200).json({
            message: "Resume download link generated",
            downloadUrl,
            expiresIn: 60
        });

    } catch (error) {
        console.error("Resume download error:", error);

        return res.status(500).json({
            message: "Unable to generate resume download link"
        });
    }
};