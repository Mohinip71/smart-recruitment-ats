// Demo data seed. Idempotent — safe to re-run.
// Usage (from backend/):  node prisma/seed.js
import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/db/prisma.js";

const PASSWORD = await bcrypt.hash("password123", 10);

async function main() {
  // --- Users (upsert by email) ---
  const recruiter = await prisma.user.upsert({
    where: { email: "recruiter@ats.dev" },
    update: { role: "RECRUITER" },
    create: { name: "Recruiter One", email: "recruiter@ats.dev", password: PASSWORD, role: "RECRUITER" },
  });

  const candidate = await prisma.user.upsert({
    where: { email: "candidate@ats.dev" },
    update: { role: "CANDIDATE" },
    create: { name: "Candidate One", email: "candidate@ats.dev", password: PASSWORD, role: "CANDIDATE" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@ats.dev" },
    update: { role: "ADMIN" },
    create: { name: "Admin One", email: "admin@ats.dev", password: PASSWORD, role: "ADMIN" },
  });

  // --- Job (published, owned by recruiter) ---
  let job = await prisma.job.findFirst({
    where: { title: "Backend Engineer", recruiterId: recruiter.id },
  });
  if (!job) {
    job = await prisma.job.create({
      data: {
        title: "Backend Engineer",
        description: "Build and maintain Node/Express APIs with PostgreSQL. Work on a modern ATS platform.",
        location: "Remote",
        employmentType: "FULL_TIME",
        salaryMin: 60000,
        salaryMax: 90000,
        skills: "Node.js, Express, PostgreSQL, REST",
        status: "PUBLISHED",
        recruiterId: recruiter.id,
      },
    });
  } else {
    job = await prisma.job.update({ where: { id: job.id }, data: { status: "PUBLISHED" } });
  }

  // --- Application (candidate applied, advanced to SELECTED so an offer can be created) ---
  let application = await prisma.application.findUnique({
    where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
  });
  if (!application) {
    application = await prisma.application.create({
      data: { candidateId: candidate.id, jobId: job.id, status: "SELECTED" },
    });
  } else {
    application = await prisma.application.update({
      where: { id: application.id },
      data: { status: "SELECTED" },
    });
  }

  // --- Interview (online, scheduled in 3 days) ---
  let interview = await prisma.interview.findFirst({ where: { applicationId: application.id } });
  if (!interview) {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 3);
    interview = await prisma.interview.create({
      data: {
        applicationId: application.id,
        scheduledAt,
        type: "ONLINE",
        meetingLink: "https://meet.jit.si/smart-ats-demo",
        notes: "Seed demo interview",
        status: "SCHEDULED",
      },
    });
  }

  // --- Offer (PENDING) so the candidate can accept it from the UI ---
  const joiningDate = new Date();
  joiningDate.setDate(joiningDate.getDate() + 30);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 14); // expiry must be before joining

  let offer = await prisma.offer.findUnique({ where: { applicationId: application.id } });
  if (!offer) {
    offer = await prisma.offer.create({
      data: {
        applicationId: application.id,
        salary: 75000,
        joiningDate,
        expiryDate,
        status: "PENDING",
        notes: "Seed offer — awaiting candidate response.",
      },
    });
  } else {
    offer = await prisma.offer.update({
      where: { id: offer.id },
      data: { salary: 75000, joiningDate, expiryDate, status: "PENDING" },
    });
  }

  console.log("\n✅ Seed complete. Demo accounts (password123):");
  console.log("   recruiter@ats.dev (RECRUITER)");
  console.log("   candidate@ats.dev (CANDIDATE)");
  console.log("   admin@ats.dev     (ADMIN)");
  console.log(`   jobId:         ${job.id}`);
  console.log(`   applicationId:  ${application.id}`);
  console.log(`   offerId:       ${offer.id}\n`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
