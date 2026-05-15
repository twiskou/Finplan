import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
    adapter: () => {
      const url = process.env.DATABASE_URL!;
      const authToken = process.env.DATABASE_AUTH_TOKEN;
      return new PrismaLibSql({ url, authToken });
    },
  },
});