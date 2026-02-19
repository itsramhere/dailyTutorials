"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
console.log("DATABASE_URL =", process.env.DATABASE_URL);
const client_1 = require("@prisma/client");
if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not defined in your .env file!");
}
const prisma = new client_1.PrismaClient();
exports.default = prisma;
