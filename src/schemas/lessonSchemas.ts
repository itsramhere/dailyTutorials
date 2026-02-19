import {FastifySchema} from 'fastify';

export const createLessonSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['title', 'content', 'level', 'userId'],
        properties: {
            title: { type: 'string' },
            content: {},
            level: { type: 'string', enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
            userId: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                content: {},
                level: { type: 'string', enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
                userId: { type: 'string' },
                sentAt: { type: 'string', format: 'date-time' }
            }
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } }
    }
};

export const getLessonByIdSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['lessonId'],
        properties: {
            lessonId: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                content: {},
                level: { type: 'string', enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
                userId: { type: 'string' },
                sentAt: { type: 'string', format: 'date-time' }
            }
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } }
    }
};

export const getLessonByTopicSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['topicName'],
        properties: {
            topicName: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                content: {},
                level: { type: 'string', enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
                userId: { type: 'string' },
                sentAt: { type: 'string', format: 'date-time' }
            }
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } }
    }
};

export const getAllLessonsByUserIdSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    content: {},
                    level: { type: 'string', enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
                    userId: { type: 'string' },
                    sentAt: { type: 'string', format: 'date-time' }
                }
            }
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } }
    }
};

export const getUserLessonsInDateRangeSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['userId', 'beforeDate', 'afterDate'],
        properties: {
            userId: { type: 'string' },
            beforeDate: { type: 'string', format: 'date-time' },
            afterDate: { type: 'string', format: 'date-time' }
        }
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    content: {},
                    level: { type: 'string', enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
                    userId: { type: 'string' },
                    sentAt: { type: 'string', format: 'date-time' }
                }
            }
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } }
    }
};