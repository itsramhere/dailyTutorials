import prisma from '../utils/db'
import { Prisma, Lesson} from '@prisma/client'

export async function addLesson(lessonData: Prisma.LessonCreateInput): Promise <Lesson>{
    const newLesson = await prisma.lesson.create({
        data: lessonData
    });

    return newLesson;
}

export async function getLessonById(
  id: string
): Promise<Lesson | null>{
  return prisma.lesson.findUnique({
    where: { id },
  });
}

export async function getLessonByTitle(title: string) : Promise<Lesson | null>{
    return prisma.lesson.findFirst({
    where: { title },
  });
}

export async function getAllLessonsByUserId(userId: string) : Promise<Lesson[] | null>{
    const userLessons = await prisma.lesson.findMany({
        where:{
            userId: userId
        },
        orderBy: {
            sentAt: 'desc'
        }
    });

    return userLessons;
}

export async function getUserLessonsInDateRange(userId: string, sendBefore: Date, sendAfter:Date):Promise<Lesson[] | null>{
    const userLessons = await prisma.lesson.findMany({
        where:{
            userId: userId,
            sentAt: {
                gte: sendAfter,
                lte: sendBefore
            }
        },
        orderBy: {
            sentAt: 'desc'
        }
    });
    return userLessons;
}

export async function findLessonBySlug(slug: string): Promise<Lesson | null> {
    return await prisma.lesson.findFirst({
        where: {slug }
    });
}