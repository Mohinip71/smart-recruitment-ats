import multer from "multer";

export const errorHandler = (err, req, res, next) => {
    console.error("Global Error:", err);

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "File size exceeds the allowed limit"
            });
        }

        return res.status(400).json({
            message: err.message
        });
    }

    if (
        err.message?.includes("Only PDF") ||
        err.message?.includes("Only JPG") ||
        err.message?.includes("Only PNG") ||
        err.message?.includes("Only WEBP")
    ) {
        return res.status(400).json({
            message: err.message
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
};