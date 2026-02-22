import {FastifyInstance} from 'fastify';
import {addTopicToUser, changeUserLanguage, changeUserLevel, changeUserDomain} from '../controllers/userControllers';
import {addTopicToUserSchema, editUserLanguageSchema, editUserLevelSchema, changeUserDomainSchema} from '../schemas/userSchemas';
import {topicChangeBody, LanguageChangeBody, LevelChangeBody, DomainChangeBody} from '../utils/types';
import {isAuthenticated} from '../hooks/authHooks';

export default async function userRoutes(fastify: FastifyInstance){
 fastify.patch<{Body:topicChangeBody}>('topics/add',{
    schema: addTopicToUserSchema,
    preHandler: isAuthenticated
 }, addTopicToUser
 );
 
 fastify.put<{Body:LanguageChangeBody}>('/languages/edit', {
    schema: editUserLanguageSchema,
    preHandler: isAuthenticated
 }, changeUserLanguage
);

fastify.put<{Body:LevelChangeBody}>('/levels/edit', {
    schema: editUserLevelSchema,
    preHandler: isAuthenticated
}, changeUserLevel);

fastify.put<{Body: DomainChangeBody}>('/domains/edit', {
    schema: changeUserDomainSchema,
    preHandler: isAuthenticated
}, changeUserDomain);
}