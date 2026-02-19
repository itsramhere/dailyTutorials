"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogin = exports.registerUser = void 0;
const authServices_1 = require("../services/authServices");
const registerUser = async (request, reply) => {
    const user = await (0, authServices_1.newUser)(request.body);
    reply.code(201);
    return user;
};
exports.registerUser = registerUser;
const userLogin = async (request, reply) => {
    const token = await (0, authServices_1.loginUser)(request.body.email, request.body.password);
    reply.code(200);
    return {
        success: true,
        token
    };
};
exports.userLogin = userLogin;
