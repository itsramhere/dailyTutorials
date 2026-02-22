import {FastifyRequest, FastifyReply} from 'fastify';
import {newUser, loginUser} from '../services/authServices';
import {User, signupUser} from '../utils/types';
import {AIService} from '../services/aiServices';
import {AppError} from '../utils/customErrors';

export const registerUser = async (
  request: FastifyRequest<{ Body: signupUser }>,
  reply: FastifyReply
): Promise<User> => {
  
  const introduction = request.body.introduction;

  const validationResult = await AIService.validateIntroduction(introduction);

  if (!validationResult.isValid) {
    throw new AppError(`Introduction insufficient: ${validationResult.reason}`, 400);
  }

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