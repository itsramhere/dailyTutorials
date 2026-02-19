"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
exports.updateUserLevel = updateUserLevel;
const db_1 = __importDefault(require("../utils/db"));
async function createUser(data) {
    return db_1.default.user.create({
        data,
    });
}
async function getUserByEmail(email) {
    return db_1.default.user.findUnique({
        where: { email },
    });
}
async function getUserById(id) {
    return db_1.default.user.findUnique({
        where: { id },
    });
}
async function updateUserLevel(id, newLevel) {
    return db_1.default.user.update({
        where: { id },
        data: { currentLevel: newLevel },
    });
}
