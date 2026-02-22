import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

export const aiClient = new GoogleGenAI({ apiKey });
export const MODEL_NAME = 'gemini-2.5-flash-lite';