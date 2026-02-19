"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const authControllers_1 = require("../controllers/authControllers");
const authSchemas_1 = require("../schemas/authSchemas");
const authHooks_1 = require("../hooks/authHooks");
async function authRoutes(fastify) {
    fastify.post('/signup', {
        schema: authSchemas_1.signupSchema,
        preSerialization: authHooks_1.filterUserResponse
    }, authControllers_1.registerUser);
    fastify.post('/login', {
        schema: authSchemas_1.loginSchema,
        preSerialization: authHooks_1.loginUserResponse
    }, authControllers_1.userLogin);
}
