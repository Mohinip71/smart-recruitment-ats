import multer from "multer";

const storage = multer.memoryStorage();

const imageUpload = multer({
    storage,
    limits: {
        fileSize: 3 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowed = {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"]
        };

        const extension = file.originalname
            .toLowerCase()
            .slice(file.originalname.lastIndexOf("."));

        if (
            !allowed[file.mimetype] ||
            !allowed[file.mimetype].includes(extension)
        ) {
            return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
        }

        cb(null, true);
    }
});

const resumeUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype !== "application/pdf" ||
            !file.originalname.toLowerCase().endsWith(".pdf")
        ) {
            return cb(new Error("Only PDF resumes are allowed"));
        }

        cb(null, true);
    }
});

export const uploadProfilePhoto = imageUpload.single("file");
export const uploadResume = resumeUpload.single("file");