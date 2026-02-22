import { Prisma } from '@prisma/client';

export type uncreatedLesson = {
    title: string;
    content: Prisma.InputJsonValue; 
    level: 'BEGINNER'| 'INTERMEDIATE' | 'ADVANCED';
    userId: string;
}

export interface User {
    name: string,
    id: string,
    email: string,
    introduction: string | null,
    domain: "ML" | "BACKEND" | "FRONTEND" | "DEVOPS" | "FULLSTACK",
    preferredLanguage: 'JAVASCRIPT'| 'TYPESCRIPT'| 'GO'| 'RUST' | 'PYTHON' | 'JAVA'| 'CPP'| 'CSHARP'
    currentLevel: 'BEGINNER'| 'INTERMEDIATE' | 'ADVANCED',
    topicsCovered: string[];
    createdAt?: Date;
    updatedAt?: Date;
    hashed_password: string;
    role: "user" | "admin";
    token?: string;
}

export interface Lesson{
    id: string,
    title: string,
    level: 'BEGINNER'| 'INTERMEDIATE' | 'ADVANCED',
    sentAt: Date,
    userId: string,
}

export interface Feedback{
    id: string;
    feedback: string;
    rating?: number | null;
    levelChange: boolean; 
    newLevel?: 'BEGINNER'| 'INTERMEDIATE' | 'ADVANCED' | null;
    createdAt: Date;
    userId: string;
    lessonId: string;
}

export interface signupUser{
    name: string,
    email: string,
    introduction: string,
    domain: "ML" | "BACKEND" | "FRONTEND" | "DEVOPS" | "FULLSTACK",
    preferredLanguage: 'JAVASCRIPT'| 'TYPESCRIPT'| 'GO'| 'RUST' | 'PYTHON' | 'JAVA'| 'CPP'| 'CSHARP'
    currentLevel: 'BEGINNER'| 'INTERMEDIATE' | 'ADVANCED',
    password: string;
    role: "user" | "admin";
}

export interface DailyMailUser{
  id: string;
  email: string;
  domain: string;
  preferredLanguage: string;
  topicsCovered: string[];
}

export interface topicChangeBody{
    id: string;
    newTopic: string
}

export interface LanguageChangeBody{
    id: string;
    newLanguage: 'JAVASCRIPT'| 'TYPESCRIPT'| 'GO'| 'RUST' | 'PYTHON' | 'JAVA'| 'CPP'| 'CSHARP'
}

export interface LevelChangeBody{
    id: string;
    newLevel: 'BEGINNER'| 'INTERMEDIATE' | 'ADVANCED'
}

export interface DomainChangeBody{
    id: string;
    newDomain: "ML" | "BACKEND" | "FRONTEND" | "DEVOPS" | "FULLSTACK"
}

export interface uncreatedFeedback {
    feedback: string;
    userId: string;
    lessonId: string;
    levelChange: boolean;
    rating: number;
    newLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
}

export interface elasticFile{
    title: string;
    userLevel: string;
    lessonId: string;
    userId: string;
}
