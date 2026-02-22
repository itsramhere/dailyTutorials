import { FastifyInstance } from 'fastify';
import { createFeedback, getFeedbackByUserId, getFeedbackByLessonId, getFeedbackById } from '../controllers/feedbackControllers';
import { createFeedbackSchema, getFeedbackByUserIdSchema, getFeedbackByLessonIdSchema, getFeedbackByIdSchema } from '../schemas/feedbackSchemas';
import { isAuthenticated } from '../hooks/authHooks'; // Import your hook

export default async function feedbackRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.addHook('onRequest', isAuthenticated);
    
    fastify.post('/add', { schema: createFeedbackSchema }, createFeedback);
    fastify.get('/user/:userId', { schema: getFeedbackByUserIdSchema }, getFeedbackByUserId);
    fastify.get('/lesson/:lessonId', { schema: getFeedbackByLessonIdSchema }, getFeedbackByLessonId);
    fastify.get('/:id', { schema: getFeedbackByIdSchema }, getFeedbackById);
}