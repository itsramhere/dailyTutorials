import {lessonCreation, findLessonById, findLessonByTopic, findLessonsByUserId, findLessonsinDateRange} from '../services/lessonServices';
import {FastifyRequest, FastifyReply} from 'fastify';
import {uncreatedLesson} from '../utils/types';
import { AppError } from '../utils/customErrors';
import {generateAndSaveLessonWorkflow} from '../services/workflowServices';

export async function createLesson(request: FastifyRequest<{Body: uncreatedLesson}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;
    
    if (loggedInUserId !== request.body.userId) {
        throw new AppError("Forbidden: You can only create a lesson for your own account.", 403);
    }

    const thisLesson = await lessonCreation(request.body, request.body.userId);
    reply.code(200).send(thisLesson);
}

export async function getLessonById(request: FastifyRequest<{Params: {lessonId: string}}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;

    const thisLesson = await findLessonById(request.params.lessonId);
    if (!thisLesson) {
        throw new AppError("No lesson exists with this ID.", 400);
    }

    if (thisLesson.userId !== loggedInUserId) {
        throw new AppError("Forbidden: You can only view your own lessons.", 403);
    }

    reply.code(200).send(thisLesson);
}

export async function getLessonByTopic(request: FastifyRequest<{Params: {topicName: string}}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;

    const thisLesson = await findLessonByTopic(request.params.topicName);
    if (!thisLesson) {
        throw new AppError("No lesson exists with this title.", 400);
    }

    if (thisLesson.userId !== loggedInUserId) {
        throw new AppError("Forbidden: You can only view your own lessons.", 403);
    }

    reply.code(200).send(thisLesson);
}

export async function getAllLessonsByUserId(request: FastifyRequest<{Params: {userId: string}}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;

    if (loggedInUserId !== request.params.userId) {
        throw new AppError("Forbidden: You cannot view another user's lessons.", 403);
    }

    const userLessons = await findLessonsByUserId(request.params.userId);
    if (!userLessons) {
        throw new AppError("No lessons exist with this user Id.", 400);
    }
    reply.code(200).send(userLessons);
}

export async function getUserLessonsInDateRange(request: FastifyRequest<{
    Body: {
        userId: string,
        beforeDate: string,
        afterDate: string
    }
}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;

    if (loggedInUserId !== request.body.userId) {
        throw new AppError("Forbidden: You cannot view another user's lessons.", 403);
    }

    const beginDate = new Date(request.body.afterDate);
    const endDate = new Date(request.body.beforeDate);

    const userLessons = await findLessonsinDateRange(request.body.userId, endDate, beginDate);
    if (!userLessons) {
        throw new AppError("No lessons exist either with this user Id or in this date range.", 400);
    }
    reply.code(200).send(userLessons);
}

export async function generateUserLesson(request: FastifyRequest<{Params: {userId: string}}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;

    if (loggedInUserId !== request.params.userId) {
        throw new AppError("Forbidden: You cannot generate a lesson for another user.", 403);
    }

    const result = await generateAndSaveLessonWorkflow(request.params.userId);
    reply.code(200).send(result);
}