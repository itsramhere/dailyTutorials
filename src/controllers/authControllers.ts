import {FastifyRequest, FastifyReply} from 'fastify';
import {newUser, loginUser} from '../services/authServices';
import {User, signupUser} from '../utils/types';

export const registerUser = async (
  request: FastifyRequest<{ Body: signupUser }>,
  reply: FastifyReply
): Promise<User> => {
  const user = await newUser(request.body);
  reply.code(201);
  return user;
};

export const userLogin = async (
  request: FastifyRequest<{ Body: { email: string, password: string } }>,
  reply: FastifyReply
): Promise<{ success: boolean, token: string }> => {
  const token = await loginUser(request.body.email, request.body.password);
  reply.code(200);
  return { 
    success: true, 
    token 
  };
};