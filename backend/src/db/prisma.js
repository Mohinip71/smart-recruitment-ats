import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma=new PrismaClient({
    adapter,
})

export default prisma;

async function testDatabaseConnection() {
  try {
    const userCount = await prisma.user.count();

    console.log("Database connected successfully!");
    console.log("Users:", userCount);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testDatabaseConnection();
