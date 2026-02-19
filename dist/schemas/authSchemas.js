"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signupSchema = void 0;
exports.signupSchema = {
    body: {
        type: 'object',
        required: ['email', 'password', 'name', 'introduction', 'domain', 'preferredLanguage', 'currentLevel'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 16 },
            name: { type: 'string', maxLength: 16 },
            introduction: { type: 'string', maxLength: 200 },
            domain: {
                type: 'string',
                enum: ["ML", "BACKEND", "FRONTEND", "DEVOPS", "FULLSTACK"]
            },
            preferredLanguage: {
                type: 'string',
                enum: ["JAVASCRIPT", "TYPESCRIPT", "GO", "RUST", "PYTHON", 'JAVA', 'CPP', 'CSHARP']
            },
            currentLevel: {
                type: 'string',
                enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
            }
        }
    }
};
exports.loginSchema = {
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
        }
    }
};
