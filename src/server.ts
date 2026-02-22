import 'dotenv/config'
import Fastify from 'fastify';
import cors from '@fastify/cors'; // IMPORT THIS
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import lessonRoutes from './routes/lessonRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import {startCronJobs} from './services/cronServices'; 

const fastify = Fastify({
  logger: true
});

const start = async () => {
  try {
    await fastify.register(cors, {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : '*', 
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    });

    fastify.register(authRoutes, {prefix: '/api/auth' });
    fastify.register(userRoutes, {prefix : '/api/users/'});
    fastify.register(lessonRoutes, {prefix: '/api/lessons'});
    fastify.register(feedbackRoutes, {prefix: '/api/feedback'});

    const projectPort = process.env.PORT ? Number(process.env.PORT) : 3000;
    
    startCronJobs(); 

    await fastify.listen({ port: projectPort });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();