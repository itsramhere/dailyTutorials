import { Feedback } from '@prisma/client';
import { uncreatedFeedback } from '../utils/types';
import { addFeedback, getFeedbackByUserId, getFeedbackByLessonId, getFeedbackById } from '../repositories/feedbackRepository';

export async function feedbackCreation(feedbackData: uncreatedFeedback): Promise<Feedback> {
    return await addFeedback({
        feedback: feedbackData.feedback,
        rating: feedbackData.rating,
        levelChange: feedbackData.levelChange,
        newLevel: feedbackData.newLevel,
        user: { connect: { id: feedbackData.userId } },
        lesson: { connect: { id: feedbackData.lessonId } }
    });
}

export async function findFeedbackByUserId(userId: string): Promise<Feedback[]> {
    return await getFeedbackByUserId(userId);
}

export async function findFeedbackByLessonId(lessonId: string): Promise<Feedback[]> {
    return await getFeedbackByLessonId(lessonId);
}

export async function findFeedbackById(id: string): Promise<Feedback | null> {
    return await getFeedbackById(id);
}