import { FastifyRequest, FastifyReply } from 'fastify';
import { uncreatedFeedback } from '../utils/types';
import { feedbackCreation, findFeedbackByUserId, findFeedbackByLessonId, findFeedbackById } from '../services/feedbackServices';
import { findLessonById } from '../services/lessonServices'; 
import { AppError } from '../utils/customErrors';
import { processQuickRating } from '../services/feedbackServices';
import jwt from 'jsonwebtoken';

export async function createFeedback(request: FastifyRequest<{Body: uncreatedFeedback}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;

    if (loggedInUserId !== request.body.userId) {
        throw new AppError('Forbidden: You can only create feedback for your own account.', 403);
    }

    const lesson = await findLessonById(request.body.lessonId);
    if (!lesson || lesson.userId !== loggedInUserId) {
        throw new AppError('Forbidden: You can only review lessons assigned to you.', 403);
    }

    const newFeedback = await feedbackCreation(request.body);
    reply.code(200).send(newFeedback);
}

export async function getFeedbackByUserId(request: FastifyRequest<{Params: {userId: string}}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;
    if (loggedInUserId !== request.params.userId) {
        throw new AppError('Forbidden: You can only view your own feedback.', 403);
    }

    const feedbacks = await findFeedbackByUserId(request.params.userId);
    if (!feedbacks.length) {
        throw new AppError('No feedback found for this user.', 400);
    }
    reply.code(200).send(feedbacks);
}

export async function getFeedbackByLessonId(request: FastifyRequest<{Params: {lessonId: string}}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;
    const lesson = await findLessonById(request.params.lessonId);
    if (!lesson || lesson.userId !== loggedInUserId) {
        throw new AppError('Forbidden: You do not have access to this lesson\'s feedback.', 403);
    }

    const feedbacks = await findFeedbackByLessonId(request.params.lessonId);
    if (!feedbacks.length) {
        throw new AppError('No feedback found for this lesson.', 400);
    }
    reply.code(200).send(feedbacks);
}

export async function getFeedbackById(request: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply): Promise<void> {
    const loggedInUserId = (request as any).user.id;
    
    const feedback = await findFeedbackById(request.params.id);
    if (!feedback) {
        throw new AppError('No feedback found with this ID.', 400);
    }
    if (feedback.userId !== loggedInUserId) {
        throw new AppError('Forbidden: You do not own this feedback record.', 403);
    }

    reply.code(200).send(feedback);
}

export async function handleQuickRate(request: FastifyRequest<{Querystring: {lessonId: string, rating: string, token: string}}>, reply: FastifyReply) {
    try {
        const { lessonId, rating, token } = request.query;

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const userId = decoded.id;
        const message = await processQuickRating(userId, lessonId, Number(rating));

        reply.type('text/html').send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h2>Feedback Received</h2>
                <p>${message}</p>
                <p>You can close this tab.</p>
            </div>
        `);
    } catch (error) {
        reply.code(400).send("Invalid or expired feedback link.");
    }
}