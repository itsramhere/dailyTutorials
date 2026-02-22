import {includeTopicToUser, editUserLanguage, editUserLevel, editUserDomain} from '../services/userServices';
import {FastifyRequest, FastifyReply} from 'fastify';
import {topicChangeBody, LanguageChangeBody, LevelChangeBody, DomainChangeBody} from '../utils/types';
import {AppError} from '../utils/customErrors';

export async function addTopicToUser(request: FastifyRequest<{Body: topicChangeBody}>, reply: FastifyReply) : Promise<void>{
    const loggedInUserId = (request as any).user.id;
    const targetUserId = request.body.id;

    if (loggedInUserId !== targetUserId) {
        throw new AppError("Forbidden: You cannot modify topics for another user.", 403);
    }

    const topicName = request.body.newTopic;
    const updatedTopics = await includeTopicToUser(targetUserId, topicName);
    reply.code(200).send(updatedTopics[updatedTopics.length - 1]);
}

export async function changeUserLanguage(request: FastifyRequest<{Body: LanguageChangeBody}>, reply: FastifyReply) : Promise<void>{
    const loggedInUserId = (request as any).user.id;
    const targetUserId = request.body.id;

    if (loggedInUserId !== targetUserId) {
        throw new AppError("Forbidden: You cannot change settings for another user.", 403);
    }

    const newLanguage = request.body.newLanguage;
    await editUserLanguage(targetUserId, newLanguage);
    reply.code(200).send({ message: `Language changed successfully to ${request.body.newLanguage}`});
}

export async function changeUserLevel(request: FastifyRequest<{Body: LevelChangeBody}>, reply: FastifyReply) : Promise<void>{
    const loggedInUserId = (request as any).user.id;
    const targetUserId = request.body.id;

    if (loggedInUserId !== targetUserId) {
        throw new AppError("Forbidden: You cannot change settings for another user.", 403);
    }

    const changedLevel = request.body.newLevel;
    await editUserLevel(targetUserId, changedLevel);
    reply.code(200).send({ message: `Level changed successfully to ${request.body.newLevel}`});
}

export async function changeUserDomain(request: FastifyRequest<{Body: DomainChangeBody}>, reply: FastifyReply) : Promise<void>{
    const loggedInUserId = (request as any).user.id;
    const targetUserId = request.body.id;

    if (loggedInUserId !== targetUserId) {
        throw new AppError("Forbidden: You cannot change settings for another user.", 403);
    }

    const newDomain = request.body.newDomain;
    await editUserDomain(targetUserId, newDomain);
    reply.code(200).send({ message: `Domain changed successfully to ${request.body.newDomain}`});
}