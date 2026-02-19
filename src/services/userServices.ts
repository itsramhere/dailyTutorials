import {addTopicToUser, getUserById, updateUserLanguage, updateUserLevel, updateUserDomain, getUsersForDailyMail} from '../repositories/userRepository';
import { AppError } from '../utils/customErrors';

export async function includeTopicToUser(userId: string, topicName: string) : Promise<string[]>{
    const thisUser = await getUserById(userId);
    if(!thisUser){
        let err = new AppError("No user exists with this ID.", 400);
        throw err;
    }
    return await addTopicToUser(thisUser, topicName);
}

export async function editUserLanguage(userId: string, newLanguage: 'JAVASCRIPT'| 'TYPESCRIPT'| 'GO'| 'RUST' | 'PYTHON' | 'JAVA'| 'CPP'| 'CSHARP') : Promise <void>{
    const thisUser = await getUserById(userId);
    if(!thisUser){
        let err = new AppError("No user exists with this ID.", 400);
        throw err;
    }
    await updateUserLanguage(thisUser, newLanguage);
}

export async function editUserLevel(userId: string, newLevel: 'BEGINNER'| 'INTERMEDIATE' | 'ADVANCED') : Promise <void>{
    const thisUser = await getUserById(userId);
    if(!thisUser){
        let err = new AppError("No user exists with this ID.", 400);
        throw err;
    }
    await updateUserLevel(thisUser, newLevel);
}

export async function editUserDomain(userId: string, domain: "ML" | "BACKEND" | "FRONTEND" | "DEVOPS" | "FULLSTACK"): Promise <void>{
    const thisUser = await getUserById(userId);
    if(!thisUser){
        let err = new AppError("No user exists with this ID.", 400);
        throw err;
    }
    await updateUserDomain(thisUser, domain);
}