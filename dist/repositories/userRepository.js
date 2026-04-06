"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
exports.updateUserLevel = updateUserLevel;
exports.addTopicToUser = addTopicToUser;
exports.updateUserLanguage = updateUserLanguage;
exports.updateUserDomain = updateUserDomain;
exports.getUsersForDailyMail = getUsersForDailyMail;
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
async function updateUserLevel(user, newLevel) {
    const id = user.id;
    return await db_1.default.user.update({
        where: { id },
        data: { currentLevel: newLevel },
    });
}
async function addTopicToUser(user, topicName) {
    const id = user.id;
    const updatedUser = await db_1.default.user.update({
        where: { id },
        data: {
            topicsCovered: {
                push: topicName
            }
        },
    });
    return updatedUser.topicsCovered;
}
async function updateUserLanguage(user, language) {
    const id = user.id;
    await db_1.default.user.update({
        where: { id },
        data: { preferredLanguage: language }
    });
}
async function updateUserDomain(user, newDomain) {
    const id = user.id;
    await db_1.default.user.update({
        where: { id },
        data: { domain: newDomain }
    });
}
async function getUsersForDailyMail(skip, take) {
    return db_1.default.user.findMany({
        skip,
        take,
        orderBy: {
            id: "asc",
        },
        select: {
            id: true,
            email: true,
            preferredLanguage: true,
            topicsCovered: true,
            domain: true
        },
    });
}
