"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLesson = addLesson;
exports.getLessonById = getLessonById;
exports.getLessonByTitle = getLessonByTitle;
exports.getAllLessonsByUserId = getAllLessonsByUserId;
exports.getUserLessonsInDateRange = getUserLessonsInDateRange;
exports.findLessonBySlug = findLessonBySlug;
const db_1 = __importDefault(require("../utils/db"));
async function addLesson(lessonData) {
    const newLesson = await db_1.default.lesson.create({
        data: lessonData
    });
    return newLesson;
}
async function getLessonById(id) {
    return db_1.default.lesson.findUnique({
        where: { id },
    });
}
async function getLessonByTitle(title) {
    return db_1.default.lesson.findFirst({
        where: { title },
    });
}
async function getAllLessonsByUserId(userId) {
    const userLessons = await db_1.default.lesson.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            sentAt: 'desc'
        }
    });
    return userLessons;
}
async function getUserLessonsInDateRange(userId, sendBefore, sendAfter) {
    const userLessons = await db_1.default.lesson.findMany({
        where: {
            userId: userId,
            sentAt: {
                gte: sendAfter,
                lte: sendBefore
            }
        },
        orderBy: {
            sentAt: 'desc'
        }
    });
    return userLessons;
}
async function findLessonBySlug(slug) {
    return await db_1.default.lesson.findFirst({
        where: { slug }
    });
}
