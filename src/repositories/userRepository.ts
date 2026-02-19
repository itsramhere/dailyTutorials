import prisma from '../utils/db'
import {Prisma, User, Language, UserLevel, Domain} from '@prisma/client'
import {DailyMailUser} from '../utils/types';

export async function createUser(
  data: Prisma.UserCreateInput
): Promise<User>{
  return prisma.user.create({
    data,
  });
}

export async function getUserByEmail(
  email: string
): Promise<User | null>{
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(
  id: string
): Promise<User | null>{
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function updateUserLevel(
  user: User,
  newLevel: UserLevel
): Promise<User> {
  const id = user.id;
  return await prisma.user.update({
    where: { id },
    data: { currentLevel: newLevel },
  });
}

export async function addTopicToUser(user: User, topicName: string): Promise<string[]> {
  const id = user.id;
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      topicsCovered: {
        push: topicName
      }
    },
  });
  return updatedUser.topicsCovered;
}

export async function updateUserLanguage(user: User, language: Language):Promise<void>{
  const id = user.id;
  await prisma.user.update({
    where:{id},
    data: {preferredLanguage: language}
  });
}


export async function updateUserDomain(user: User, newDomain: Domain) : Promise<void>{
  const id = user.id;
  await prisma.user.update({
    where:{id},
    data: {domain: newDomain}
  });
}

export async function getUsersForDailyMail(
  skip: number,
  take: number
): Promise<DailyMailUser[]> {
  return prisma.user.findMany({
    skip,
    take,
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      email: true,
      preferredLanguage: true,
      topicsCovered: true,
      domain: true
    },
  });
}