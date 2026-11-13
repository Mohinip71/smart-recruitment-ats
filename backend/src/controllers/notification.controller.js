import prisma from "../db/prisma.js";

// Get logged-in user's notifications
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: req.user.id
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            notifications
        });

    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};


// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await prisma.notification.findUnique({
            where: {
                id: notificationId
            }
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        // Important security check
        if (notification.userId !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to update this notification"
            });
        }

        const updatedNotification = await prisma.notification.update({
            where: {
                id: notificationId
            },
            data: {
                isRead: true
            }
        });

        res.status(200).json({
            message: "Notification marked as read",
            notification: updatedNotification
        });

    } catch (error) {
        console.error("Mark notification error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};