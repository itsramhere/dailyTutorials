import prisma from '../utils/db';
import { Prisma, Feedback } from '@prisma/client';

export async function addFeedback(feedbackData: Prisma.FeedbackCreateInput): Promise<Feedback> {
    return await prisma.feedback.create({
        data: feedbackData
    });
}

export async function getFeedbackByUserId(userId: string): Promise<Feedback[]> {
    return await prisma.feedback.findMany({
        where: { userId }
    });
}

export async function getFeedbackByLessonId(lessonId: string): Promise<Feedback[]> {
    return await prisma.feedback.findMany({
        where: { lessonId }
    });
}

export async function getFeedbackById(id: string): Promise<Feedback | null> {
    return await prisma.feedback.findUnique({
        where: { id }
    });
}