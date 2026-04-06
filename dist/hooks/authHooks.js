"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserResponse = exports.filterUserResponse = void 0;
exports.isAuthenticated = isAuthenticated;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customErrors_1 = require("../utils/customErrors");
const filterUserResponse = async (request, reply, payload) => {
    return {
        id: payload.id,
        email: payload.email,
        name: payload.name
    };
};
exports.filterUserResponse = filterUserResponse;
const loginUserResponse = async (request, reply, payload) => {
    return {
        success: payload.success,
        token: payload.token
    };
};
exports.loginUserResponse = loginUserResponse;
async function isAuthenticated(request, reply) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new customErrors_1.AppError('Missing token', 400);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        request.user = decoded;
    }
    catch (error) {
        reply.code(401).send({ error: 'Invalid or expired token' });
    }
}
