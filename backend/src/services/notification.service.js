import prisma from "../db/prisma.js";

export const createNotification = async ({
    userId,
    type,
    title,
    message
}) => {
    return prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message
        }
    });
};