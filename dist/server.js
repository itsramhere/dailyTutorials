"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const fastify = (0, fastify_1.default)({
    logger: true
});
fastify.register(authRoutes_1.default, { prefix: '/api/auth' });
const start = async () => {
    try {
        const projectPort = process.env.PORT ? Number(process.env.PORT) : 3000;
        await fastify.listen({ port: projectPort });
        console.log(`Server listening on ${projectPort}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
