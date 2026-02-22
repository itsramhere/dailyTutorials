import { Feedback } from '@prisma/client';
import { uncreatedFeedback } from '../utils/types';
import { addFeedback, getFeedbackByUserId, getFeedbackByLessonId, getFeedbackById } from '../repositories/feedbackRepository';
import { getUserById, updateUserLevel } from '../repositories/userRepository';
import { AppError } from '../utils/customErrors';
import prisma from '../utils/db';

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

export async function processQuickRating(userId: string, lessonId: string, rating: number) {
    const user = await getUserById(userId);
    if (!user) throw new AppError("User not found", 500);

    const newFeedback = await addFeedback({
        feedback: rating === 1 ? "Too Hard" : rating === 2 ? "Just Right" : "Too Easy",
        rating: rating,
        levelChange: false,
        user: { connect: { id: userId } },
        lesson: { connect: { id: lessonId } }
    });

    const recentFeedback = await prisma.feedback.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 3
    });

    if (recentFeedback.length === 3) {
        const allTooHard = recentFeedback.every(f => f.rating === 1);
        const allTooEasy = recentFeedback.every(f => f.rating === 3);

        if (allTooHard && user.currentLevel !== 'BEGINNER') {
            const newLevel = user.currentLevel === 'ADVANCED' ? 'INTERMEDIATE' : 'BEGINNER';
            await updateUserLevel(user, newLevel);
            
            await prisma.feedback.update({
                where: { id: newFeedback.id },
                data: { levelChange: true, newLevel: newLevel }
            });
            return `Rating saved. We noticed you were struggling, so we downgraded your level to ${newLevel} for tomorrow.`;
        }

        if (allTooEasy && user.currentLevel !== 'ADVANCED') {
            const newLevel = user.currentLevel === 'BEGINNER' ? 'INTERMEDIATE' : 'ADVANCED';
            await updateUserLevel(user, newLevel);
            
            await prisma.feedback.update({
                where: { id: newFeedback.id },
                data: { levelChange: true, newLevel: newLevel }
            });
            return `Rating saved. You're breezing through! We upgraded your level to ${newLevel} for tomorrow.`;
        }
    }

    return "Thank you for your feedback! Your rating has been saved.";
}