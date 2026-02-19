import {includeTopicToUser, editUserLanguage, editUserLevel, editUserDomain} from '../services/userServices';
import {FastifyRequest, FastifyReply} from 'fastify';
import {topicChangeBody, LanguageChangeBody, LevelChangeBody, DomainChangeBody} from '../utils/types';

export async function addTopicToUser(request: FastifyRequest<{Body: topicChangeBody}>, reply: FastifyReply) : Promise<void>{
    const userId = request.body.id;
    const topicName = request.body.newTopic;
    const updatedTopics = await includeTopicToUser(userId, topicName);
    reply.code(200).send(updatedTopics[updatedTopics.length - 1]);
}

export async function changeUserLanguage(request: FastifyRequest<{Body: LanguageChangeBody}>, reply: FastifyReply) : Promise<void>{
    const userId = request.body.id;
    const newLanguage = request.body.newLanguage;
    await editUserLanguage(userId, newLanguage);
    reply.code(200).send({ message: `Language changed successfully to ${request.body.newLanguage}`});
}

export async function changeUserLevel(request: FastifyRequest<{Body: LevelChangeBody}>, reply: FastifyReply) : Promise<void>{
    const userId = request.body.id;
    const changedLevel = request.body.newLevel;
    await editUserLevel(userId, changedLevel);
    reply.code(200).send({ message: `Level changed successfully to ${request.body.newLevel}`});
}

export async function changeUserDomain(request: FastifyRequest<{Body: DomainChangeBody}>, reply: FastifyReply) : Promise<void>{
    const userId = request.body.id;
    const newDomain = request.body.newDomain;
    await editUserDomain(userId, newDomain);
    reply.code(200).send({ message: `Domain changed successfully to ${request.body.newDomain}`});
}