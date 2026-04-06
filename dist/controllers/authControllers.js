"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogin = exports.registerUser = void 0;
const authServices_1 = require("../services/authServices");
const aiServices_1 = require("../services/aiServices");
const customErrors_1 = require("../utils/customErrors");
const registerUser = async (request, reply) => {
    const introduction = request.body.introduction;
    const validationResult = await aiServices_1.AIService.validateIntroduction(introduction);
    if (!validationResult.isValid) {
        throw new customErrors_1.AppError(`Introduction insufficient: ${validationResult.reason}`, 400);
    }
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
