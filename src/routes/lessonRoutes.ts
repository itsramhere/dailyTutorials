import {FastifyInstance} from 'fastify';
import {createLesson, getLessonById, getLessonByTopic, getAllLessonsByUserId, getUserLessonsInDateRange} from '../controllers/lessonControllers';
import {getUserLessonsInDateRangeSchema, getAllLessonsByUserIdSchema, getLessonByTopicSchema, getLessonByIdSchema, createLessonSchema} from '../schemas/lessonSchemas';

export default async function lessonRoutes(fastify: FastifyInstance){

    fastify.post('/add', {
        schema: createLessonSchema
    }, createLesson);

    fastify.get('/id/:lessonId', {
        schema: getLessonByIdSchema
    }, getLessonById);

    fastify.get('/topic/:topicName', {
    schema: getLessonByTopicSchema
    }, getLessonByTopic);

    fastify.get('/users/:userId', {
        schema: getAllLessonsByUserIdSchema
    }, getAllLessonsByUserId);

    fastify.post('/in-date-range', {
        schema: getUserLessonsInDateRangeSchema
    }, getUserLessonsInDateRange)
};
