"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors")); // IMPORT THIS
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const lessonRoutes_1 = __importDefault(require("./routes/lessonRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const cronServices_1 = require("./services/cronServices");
const fastify = (0, fastify_1.default)({
    logger: true
});
const start = async () => {
    try {
        await fastify.register(cors_1.default, {
            origin: process.env.NODE_ENV === 'production'
                ? process.env.FRONTEND_URL
                : '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true
        });
        fastify.register(authRoutes_1.default, { prefix: '/api/auth' });
        fastify.register(userRoutes_1.default, { prefix: '/api/users/' });
        fastify.register(lessonRoutes_1.default, { prefix: '/api/lessons' });
        fastify.register(feedbackRoutes_1.default, { prefix: '/api/feedback' });
        const projectPort = process.env.PORT ? Number(process.env.PORT) : 3000;
        (0, cronServices_1.startCronJobs)();
        await fastify.listen({ port: projectPort });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
