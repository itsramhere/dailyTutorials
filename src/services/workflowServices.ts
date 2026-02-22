import { AIService } from './aiServices';
import { getFromIndex, writeToIndex } from './elasticServices';
import { lessonCreation, findLessonById } from './lessonServices';
import { sendDailyLessonEmail } from './emailServices';
import { getUserById } from '../repositories/userRepository';
import { includeTopicToUser } from './userServices';
import { AppError } from '../utils/customErrors';
import { toSlug } from '../utils/slug';

export async function generateAndSaveLessonWorkflow(userId: string) {
    const user = await getUserById(userId);
    if (!user) throw new AppError(`User ${userId} not found.`, 404);

    const plannedTopic = await AIService.generateTitleofEssay(user.id);

    const cachedLessonId = await getFromIndex(plannedTopic, user.currentLevel);
    
    let finalTitle = "";
    let finalContentString = "";

    if (cachedLessonId) {
        const existingLesson = await findLessonById(cachedLessonId);
        if (!existingLesson) throw new AppError("Cached lesson missing from DB", 500);

        const cacheIsCovered = user.topicsCovered.some(
            (t) => toSlug(t) === toSlug(existingLesson.title)
        );

        if (cacheIsCovered) {
            console.warn(`[Workflow] Cache hit "${existingLesson.title}" is already covered. Generating fresh.`);
            const generated = await AIService.generateDailyEssayForUser(user.id, plannedTopic);
            finalTitle = generated.title;
            finalContentString = generated.content;
        } else {
            finalTitle = existingLesson.title;
            finalContentString = (existingLesson.content as any).markdown;
        }
    } else {
        const generated = await AIService.generateDailyEssayForUser(user.id, plannedTopic);
        finalTitle = generated.title;
        finalContentString = generated.content;

        const newLesson = await lessonCreation({
            title: finalTitle,
            content: { markdown: finalContentString },
            level: user.currentLevel,
            userId: user.id
        }, user.id);

        await writeToIndex({
            title: finalTitle,
            userLevel: user.currentLevel,
            lessonId: newLesson.id,
            userId: user.id
        });
    }

    await sendDailyLessonEmail(user.email, finalTitle, finalContentString);

    const alreadyCovered = user.topicsCovered.some(
        (t) => toSlug(t) === toSlug(finalTitle)
    );

    if (!alreadyCovered) {
        await includeTopicToUser(user.id, finalTitle);
    }

    return { 
        message: cachedLessonId ? "Lesson retrieved from cache and sent" : "New lesson generated, cached, and sent", 
        title: finalTitle 
    };
}