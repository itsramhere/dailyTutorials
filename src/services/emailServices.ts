import nodemailer from 'nodemailer';
import { marked } from 'marked';
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
  markdownContent: string
): Promise<void> {
  const parsedHtml = await marked.parse(markdownContent);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        code { background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
        pre { background-color: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
      </style>
    </head>
    <body>
      ${parsedHtml}
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