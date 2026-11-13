import prisma from "../db/prisma.js";

export const getDashboardAnalytics = async (req, res) => {
    try {
        const isAdmin = req.user.role === "ADMIN";

        // Recruiters can access only their own hiring data.
        const jobWhere = isAdmin
            ? {}
            : { recruiterId: req.user.id };

        const applicationWhere = isAdmin
            ? {}
            : {
                job: {
                    is: {
                        recruiterId: req.user.id
                    }
                }
            };

        const interviewWhere = isAdmin
            ? {}
            : {
                application: {
                    is: {
                        job: {
                            is: {
                                recruiterId: req.user.id
                            }
                        }
                    }
                }
            };

        const offerWhere = isAdmin
            ? {}
            : {
                application: {
                    is: {
                        job: {
                            is: {
                                recruiterId: req.user.id
                            }
                        }
                    }
                }
            };

        const onboardingWhere = isAdmin
            ? {}
            : {
                offer: {
                    is: {
                        application: {
                            is: {
                                job: {
                                    is: {
                                        recruiterId: req.user.id
                                    }
                                }
                            }
                        }
                    }
                }
            };

        // Fetch existing dashboard metrics.
        const [
            totalJobs,
            activeJobs,
            totalApplications,
            applicationsByStatus,
            totalInterviews,
            interviewsByStatus,
            totalOffers,
            offersByStatus,
            totalOnboardings,
            onboardingsByStatus,

            // Advanced analytics data.
            interviewApplications,
            acceptedOffers
        ] = await Promise.all([

            prisma.job.count({
                where: jobWhere
            }),

            prisma.job.count({
                where: {
                    ...jobWhere,
                    status: "PUBLISHED"
                }
            }),

            prisma.application.count({
                where: applicationWhere
            }),

            prisma.application.groupBy({
                by: ["status"],
                where: applicationWhere,
                _count: {
                    id: true
                }
            }),

            prisma.interview.count({
                where: interviewWhere
            }),

            prisma.interview.groupBy({
                by: ["status"],
                where: interviewWhere,
                _count: {
                    id: true
                }
            }),

            prisma.offer.count({
                where: offerWhere
            }),

            prisma.offer.groupBy({
                by: ["status"],
                where: offerWhere,
                _count: {
                    id: true
                }
            }),

            prisma.onboarding.count({
                where: onboardingWhere
            }),

            prisma.onboarding.groupBy({
                by: ["status"],
                where: onboardingWhere,
                _count: {
                    id: true
                }
            }),

            // Get application IDs having at least one interview.
            prisma.interview.findMany({
                where: interviewWhere,
                select: {
                    applicationId: true
                },
                distinct: ["applicationId"]
            }),

            // Get accepted offers with application creation dates.
            prisma.offer.findMany({
                where: {
                    ...offerWhere,
                    status: "ACCEPTED"
                },
                select: {
                    updatedAt: true,
                    application: {
                        select: {
                            createdAt: true
                        }
                    }
                }
            })
        ]);

        // ----------------------------------
        // 1. Application-to-interview rate
        // ----------------------------------

        const applicationsWithInterview =
            interviewApplications.length;

        const applicationToInterviewRate =
            totalApplications > 0
                ? Number(
                    (
                        applicationsWithInterview /
                        totalApplications *
                        100
                    ).toFixed(2)
                )
                : 0;

        // ----------------------------------
        // 2. Offer acceptance rate
        // ----------------------------------

        const acceptedOfferCount =
            offersByStatus.find(
                item => item.status === "ACCEPTED"
            )?._count.id || 0;

        const offerAcceptanceRate =
            totalOffers > 0
                ? Number(
                    (
                        acceptedOfferCount /
                        totalOffers *
                        100
                    ).toFixed(2)
                )
                : 0;

        // ----------------------------------
        // 3. Hiring conversion rate
        // ----------------------------------

        const selectedApplications =
            applicationsByStatus.find(
                item => item.status === "SELECTED"
            )?._count.id || 0;

        const hiringConversionRate =
            totalApplications > 0
                ? Number(
                    (
                        selectedApplications /
                        totalApplications *
                        100
                    ).toFixed(2)
                )
                : 0;

        // ----------------------------------
        // 4. Average time-to-hire
        // ----------------------------------

        let totalHiringDays = 0;

        acceptedOffers.forEach(offer => {
            const applicationDate =
                new Date(offer.application.createdAt);

            const offerDate =
                new Date(offer.updatedAt);

            const difference =
                offerDate.getTime() - applicationDate.getTime();

            totalHiringDays +=
                Math.max(0, difference / (1000 * 60 * 60 * 24));
        });

        const averageTimeToHire =
            acceptedOffers.length > 0
                ? Number(
                    (
                        totalHiringDays /
                        acceptedOffers.length
                    ).toFixed(2)
                )
                : 0;

        // ----------------------------------
        // 5. Monthly hiring trends (6 months)
        // ----------------------------------

        const now = new Date();

        const startDate = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth() - 5,
                1
            )
        );

        const [
            monthlyApplications,
            monthlyOffers,
            monthlyOnboardings
        ] = await Promise.all([

            prisma.application.findMany({
                where: {
                    ...applicationWhere,
                    createdAt: {
                        gte: startDate
                    }
                },
                select: {
                    createdAt: true
                }
            }),

            prisma.offer.findMany({
                where: {
                    ...offerWhere,
                    createdAt: {
                        gte: startDate
                    }
                },
                select: {
                    createdAt: true
                }
            }),

            prisma.onboarding.findMany({
                where: {
                    ...onboardingWhere,
                    createdAt: {
                        gte: startDate
                    }
                },
                select: {
                    createdAt: true
                }
            })
        ]);

        const monthlyTrends = [];

        for (let i = 0; i < 6; i++) {
            const monthDate = new Date(
                Date.UTC(
                    startDate.getUTCFullYear(),
                    startDate.getUTCMonth() + i,
                    1
                )
            );

            const year = monthDate.getUTCFullYear();
            const month = monthDate.getUTCMonth();

            const monthKey =
                `${year}-${String(month + 1).padStart(2, "0")}`;

            const countForMonth = records =>
                records.filter(record => {
                    const date = new Date(record.createdAt);

                    return (
                        date.getUTCFullYear() === year &&
                        date.getUTCMonth() === month
                    );
                }).length;

            monthlyTrends.push({
                month: monthKey,
                applications: countForMonth(monthlyApplications),
                offers: countForMonth(monthlyOffers),
                onboardings: countForMonth(monthlyOnboardings)
            });
        }

        // ----------------------------------
        // Final dashboard response
        // ----------------------------------

        res.status(200).json({
            message: "Dashboard analytics fetched successfully",

            dashboard: {

                jobs: {
                    total: totalJobs,
                    active: activeJobs
                },

                applications: {
                    total: totalApplications,
                    byStatus: applicationsByStatus
                },

                interviews: {
                    total: totalInterviews,
                    byStatus: interviewsByStatus
                },

                offers: {
                    total: totalOffers,
                    byStatus: offersByStatus
                },

                onboarding: {
                    total: totalOnboardings,
                    byStatus: onboardingsByStatus
                },

                performance: {
                    applicationsWithInterview,
                    applicationToInterviewRate,

                    acceptedOfferCount,
                    offerAcceptanceRate,

                    selectedApplications,
                    hiringConversionRate,

                    averageTimeToHireDays: averageTimeToHire
                },

                monthlyTrends
            }
        });

    } catch (error) {
        console.error("Dashboard analytics error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};