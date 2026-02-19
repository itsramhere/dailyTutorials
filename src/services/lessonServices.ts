import {Lesson} from "@prisma/client";
import {addLesson, getLessonById, getLessonByTitle, getAllLessonsByUserId, getUserLessonsInDateRange, findLessonBySlug} from '../repositories/lessonRepository';
import {uncreatedLesson} from '../utils/types';
import {getUserById} from '../repositories/userRepository';
import { toSlug } from '../utils/slug';


export async function findLessonById(lessonId: string) : Promise <Lesson | null>{
    return await getLessonById(lessonId);
}

export async function lessonCreation(lessonData: uncreatedLesson, userId: string): Promise<Lesson> {
    const thisUser = await getUserById(userId);
    if (!thisUser) throw new Error(`User with id ${userId} not found`);

    return await addLesson({
        title: lessonData.title,
        content: lessonData.content,
        level: thisUser.currentLevel,
        slug: toSlug(lessonData.title),
        user: { connect: { id: userId } }
    });
}

export async function findLessonByTopic(topicName: string): Promise<Lesson | null> {
    return await findLessonBySlug(toSlug(topicName));
}


export async function findLessonsByUserId(userId: string) :  Promise <Lesson[] | null>{
    return await getAllLessonsByUserId(userId);
}

export async function findLessonsinDateRange(userId: string, beforeDate: Date, afterDate: Date) : Promise <Lesson[] | null>{
    return await getUserLessonsInDateRange(userId, afterDate, beforeDate);
}

