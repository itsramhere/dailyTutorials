import 'dotenv/config'
import Fastify from 'fastify';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import fastifyJwt from '@fastify/jwt';
import lessonRoutes from './routes/lessonRoutes';
import feedbackRoutes from './routes/feedbackRoutes';

const fastify = Fastify({
  logger: true
});


fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string
});

fastify.register(authRoutes, {prefix: '/api/auth' });
fastify.register(userRoutes, {prefix : '/api/users/'});
fastify.register(lessonRoutes, {prefix: '/api/lessons'});
fastify.register(feedbackRoutes, {prefix: '/api/feedback'});
const start = async () => {
  try {
    const projectPort = process.env.PORT ? Number(process.env.PORT) : 3000;
    await fastify.listen({ port: projectPort });
    
    console.log(`Server listening on ${projectPort}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();