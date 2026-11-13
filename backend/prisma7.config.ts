import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // ensures .env variables are loaded

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});