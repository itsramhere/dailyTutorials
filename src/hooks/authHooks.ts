import { FastifyReply, FastifyRequest } from 'fastify';

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
        await request.jwtVerify();
    } catch (error) {
        reply.code(401).send({ error: 'Invalid or expired token' });
    }
}