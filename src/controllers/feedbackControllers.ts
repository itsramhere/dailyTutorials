import { FastifyRequest, FastifyReply } from 'fastify';
import { uncreatedFeedback } from '../utils/types';
import { feedbackCreation, findFeedbackByUserId, findFeedbackByLessonId, findFeedbackById } from '../services/feedbackServices';
import { AppError } from '../utils/customErrors';

export async function createFeedback(request: FastifyRequest<{Body: uncreatedFeedback}>, reply: FastifyReply): Promise<void> {
    const newFeedback = await feedbackCreation(request.body);
    reply.code(200).send(newFeedback);
}

export async function getFeedbackByUserId(request: FastifyRequest<{Params: {userId: string}}>, reply: FastifyReply): Promise<void> {
    const feedbacks = await findFeedbackByUserId(request.params.userId);
    if (!feedbacks.length) {
        throw new AppError('No feedback found for this user.', 400);
    }
    reply.code(200).send(feedbacks);
}

export async function getFeedbackByLessonId(request: FastifyRequest<{Params: {lessonId: string}}>, reply: FastifyReply): Promise<void> {
    const feedbacks = await findFeedbackByLessonId(request.params.lessonId);
    if (!feedbacks.length) {
        throw new AppError('No feedback found for this lesson.', 400);
    }
    reply.code(200).send(feedbacks);
}

export async function getFeedbackById(request: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply): Promise<void> {
    const feedback = await findFeedbackById(request.params.id);
    if (!feedback) {
        throw new AppError('No feedback found with this ID.', 400);
    }
    reply.code(200).send(feedback);
}