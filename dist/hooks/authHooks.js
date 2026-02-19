"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserResponse = exports.filterUserResponse = void 0;
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
        id: payload.id,
        email: payload.email
    };
};
exports.loginUserResponse = loginUserResponse;
