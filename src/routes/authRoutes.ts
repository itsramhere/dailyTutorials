import {FastifyInstance} from 'fastify';
import {registerUser, userLogin} from '../controllers/authControllers';
import {signupSchema, loginSchema} from '../schemas/authSchemas';
import {signupUser} from '../utils/types'; 
import {filterUserResponse, loginUserResponse} from '../hooks/authHooks';

export default async function authRoutes(fastify: FastifyInstance) {

  fastify.post<{Body: signupUser}>('/signup', { 
    schema: signupSchema,
    preSerialization: filterUserResponse 
  }, registerUser);

  fastify.post<{ Body: { email: string, password: string } }>('/login', {
  schema: loginSchema,
  preSerialization: loginUserResponse
  },
  userLogin);
}