import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/customErrors';

export const filterUserResponse = async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name
  };
};


export const loginUserResponse = async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
  return {
    success: payload.success,
    token: payload.token
  };
};

export async function isAuthenticated(request: FastifyRequest, reply: FastifyReply) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET as string;
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Missing token', 400);
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        (request as any).user = decoded;
        
    } catch (error) {
        reply.code(401).send({ error: 'Invalid or expired token' });
    }
}