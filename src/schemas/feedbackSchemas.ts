import { FastifySchema } from 'fastify';

const feedbackResponseProperties = {
    id: { type: 'string' },
    feedback: { type: 'string' },
    rating: { type: 'number' },
    levelChange: { type: 'boolean' },
    newLevel: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    userId: { type: 'string' },
    lessonId: { type: 'string' }
};

const errorResponse = {
    type: 'object',
    properties: { error: { type: 'string' } }
};

export const createFeedbackSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['feedback', 'userId', 'lessonId', 'levelChange', 'rating'],
        properties: {
            feedback: { type: 'string' },
            userId: { type: 'string' },
            lessonId: { type: 'string' },
            levelChange: { type: 'boolean' },
            rating: { type: 'number' },
            newLevel: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] }
        }
    },
    response: {
        200: { type: 'object', properties: feedbackResponseProperties },
        400: errorResponse,
        500: errorResponse
    }
};

export const getFeedbackByUserIdSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'string' }
        }
    },
    response: {
        200: { type: 'array', items: { type: 'object', properties: feedbackResponseProperties } },
        400: errorResponse,
        500: errorResponse
    }
};

export const getFeedbackByLessonIdSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['lessonId'],
        properties: {
            lessonId: { type: 'string' }
        }
    },
    response: {
        200: { type: 'array', items: { type: 'object', properties: feedbackResponseProperties } },
        400: errorResponse,
        500: errorResponse
    }
};

export const getFeedbackByIdSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: { type: 'object', properties: feedbackResponseProperties },
        400: errorResponse,
        500: errorResponse
    }
};