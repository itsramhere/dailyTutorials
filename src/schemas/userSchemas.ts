import {FastifySchema} from 'fastify';

export const addTopicToUserSchema : FastifySchema = {
    body:
    {
        type: 'object',
        required: ['id', 'newTopic'],
        properties: {
            id:{
                type: 'string'
            },
            newTopic:{
                type: 'string'
            }
        }
    },
    response:{
        200:{
            type: 'string'
        },
        400:{
            type: 'string'
        },
        500:{
            type: 'string'
        }
    }
};

export const editUserLanguageSchema : FastifySchema = {
    body:{
        type: 'object',
        required: ['id', 'newLanguage'],
        properties:{
            id:{
                type: 'string'
            },
            newLanguage:{
                type: 'string',
                enum: ["JAVASCRIPT", "TYPESCRIPT", "GO", "RUST", "PYTHON", 'JAVA', 'CPP', 'CSHARP']
            }
        }
    },
    response:{
        200:{
            type: 'string'
        },
        400:{
            type: 'string'
        },
        500:{
            type: 'string'
        }
    }
};

export const editUserLevelSchema : FastifySchema = {
    body:{
        type: 'object',
        required: ['id', 'newLevel'],
        properties:{
            id:{
                type:'string'
            },
            newLevel:{
                type:'string',
                enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
            }
        }
    },
    response:{
        200:{
            type: 'string'
        },
        400:{
            type: 'string'
        },
        500:{
            type: 'string'
        }
    }
};

export const changeUserDomainSchema: FastifySchema = {
    body:{
        type: 'object',
        required: ['id', 'newDomain'],
        properties:{
            id:{
                type: 'string'
            },
            newDomain:{
                type: 'string',
                enum: ["ML", "BACKEND", "FRONTEND", "DEVOPS", "FULLSTACK"]
            }
        }
    },
    response:{
        200:{
            type: 'string'
        },
        400:{
            type: 'string'
        },
        500:{
            type: 'string'
        }
    }
};

