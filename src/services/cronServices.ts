import cron from 'node-cron';
import {getUsersForDailyMail} from '../repositories/userRepository';
import {generateAndSaveLessonWorkflow} from './workflowServices';
import { AppError} from '../utils/customErrors';

export function startCronJobs() {
    cron.schedule('0 8 * * 1-5', async () => {
        try {
            let skip = 0;
            const take = 50; 
            let hasMoreUsers = true;

            while (hasMoreUsers) {
                const users = await getUsersForDailyMail(skip, take);

                if (users.length === 0) {
                    hasMoreUsers = false;
                    break;
                }

                for (const user of users) {
                    try {
                        await generateAndSaveLessonWorkflow(user.id);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (userError) {
                        throw new AppError(`Could not process cron job for user ${user.id}`, 500);
                    }
                }

                skip += take;
            }

        } catch (error) {
            throw new AppError(`Critical failure in Daily Engine`, 500);
        }
    });
}