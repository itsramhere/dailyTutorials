import nodemailer from 'nodemailer';
import { marked } from 'marked';
import {generateToken} from '../utils/authUtils';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendDailyLessonEmail(
  userEmail: string, 
  lessonTitle: string, 
  markdownContent: string,
  lessonId: string, // ADD THIS
  userId: string    // ADD THIS
): Promise<void> {
  const parsedHtml = await marked.parse(markdownContent);

  // Create a secure token specifically for this email link
  const emailToken = generateToken({ id: userId, email: userEmail });
  
  // Replace with your actual deployed URL later
  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        code { background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
        pre { background-color: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
        .feedback-box { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; }
        .btn { display: inline-block; margin: 0 10px; padding: 10px 15px; text-decoration: none; border-radius: 5px; color: white; }
        .btn-hard { background-color: #ef4444; }
        .btn-good { background-color: #22c55e; }
        .btn-easy { background-color: #3b82f6; }
      </style>
    </head>
    <body>
      ${parsedHtml}
      
      <div class="feedback-box">
        <h3>How was today's lesson?</h3>
        <a href="${baseUrl}/api/feedback/quick-rate?lessonId=${lessonId}&rating=1&token=${emailToken}" class="btn btn-hard">Too Hard</a>
        <a href="${baseUrl}/api/feedback/quick-rate?lessonId=${lessonId}&rating=2&token=${emailToken}" class="btn btn-good">Just Right</a>
        <a href="${baseUrl}/api/feedback/quick-rate?lessonId=${lessonId}&rating=3&token=${emailToken}" class="btn btn-easy">Too Easy</a>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: '"Daily Tutorials" <noreply@yourdomain.com>',
    to: userEmail,
    subject: `Your Daily Lesson: ${lessonTitle}`,
    html: emailHtml,
  });
}