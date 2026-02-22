import { aiClient, MODEL_NAME } from '../utils/gemini';
import { Type } from '@google/genai';
import { getUserById } from '../repositories/userRepository';
import { AppError } from '../utils/customErrors';
import { toSlug } from '../utils/slug';

const MAX_PLANNER_RETRIES = 3;

export class AIService {
 
  private static isCoveredTopic(candidate: string, coveredTopics: string[]): boolean {
    const candidateSlug = toSlug(candidate);
    for (const topic of coveredTopics) {
      const topicSlug = toSlug(topic);
      if (
        candidateSlug === topicSlug ||
        candidateSlug.includes(topicSlug) ||
        topicSlug.includes(candidateSlug)
      ) {
        return true;
      }
    }
    return false;
  }


  private static buildPlannerPrompt(
    level: string,
    domain: string,
    coveredTopics: string[],
    previousBadSuggestions: string[]
  ): string {
    const coveredTopicsXml =
      coveredTopics.length > 0
        ? `<covered_topics_EXCLUDE_ALL_OF_THESE>\n${coveredTopics
            .map((t, i) => `  ${i + 1}. ${t}`)
            .join('\n')}\n</covered_topics_EXCLUDE_ALL_OF_THESE>`
        : `<covered_topics_EXCLUDE_ALL_OF_THESE>None yet — this is the student's very first lesson.</covered_topics_EXCLUDE_ALL_OF_THESE>`;

    const badSuggestionsBlock =
      previousBadSuggestions.length > 0
        ? `<previous_attempts_REJECTED>
  These suggestions were already rejected because they duplicated a covered topic.
  Do NOT suggest any of these again:
${previousBadSuggestions.map((s) => `  - "${s}"`).join('\n')}
</previous_attempts_REJECTED>`
        : '';

    return `
You are an expert technical tutor building a progressive curriculum for ${domain}.

<student_profile>
  Level: ${level}
  Domain: ${domain}
</student_profile>

${coveredTopicsXml}

${badSuggestionsBlock}

<example>
  <covered>REST API Design, HTTP Status Codes, JSON Parsing</covered>
  <wrong_answer>REST API Design</wrong_answer>
  <correct_answer>API Authentication with JWT</correct_answer>
  <why>REST API Design is already covered. JWT Auth is the natural next frontier.</why>
</example>

<your_task>
  Generate the single best NEXT topic title for this student.

  Step 1 — Verify exclusions: Explicitly name 3 topics from the covered list that you are NOT allowed to suggest.
  Step 2 — Identify the frontier: Describe the leading edge of what this student already knows.
  Step 3 — Generate ONE new topic that is a logical step beyond that frontier, and that does NOT appear in any exclusion list above.

  The value you place in "title" MUST NOT match anything inside <covered_topics_EXCLUDE_ALL_OF_THESE> or <previous_attempts_REJECTED>.
</your_task>
    `.trim();
  }

  static async validateIntroduction(
    introduction: string
  ): Promise<{ isValid: boolean; reason: string }> {
    const prompt = `
      You are a strict validator for a technical learning platform.
      Analyze the following user introduction: "${introduction}"

      Determine if it provides enough context about their technical background
      (e.g., current stack, experience level, goals) to create a personalized curriculum.

      If it is vague (e.g., "I want to learn code"), mark it invalid.
      If it is specific (e.g., "I know React but want to learn Backend"), mark it valid.
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        isValid: { type: Type.BOOLEAN },
        reason: { type: Type.STRING },
      },
      required: ['isValid', 'reason'],
    };

    try {
      const response = await aiClient.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const resultText = response.text;
      if (!resultText) return { isValid: false, reason: 'AI failed to generate response' };

      return JSON.parse(resultText);
    } catch (error) {
      console.error('AI Validation Error:', error);
      throw new AppError('Failed to validate introduction', 500);
    }
  }

  static async generateTitleofEssay(userId: string): Promise<string> {
    const user = await getUserById(userId);

    if (!user) {
      throw new AppError(`User with ID ${userId} not found in the database.`, 400);
    }

    const level = user.currentLevel || 'Beginner';
    const domain = user.domain || 'General Computer Science';
    const coveredTopics: string[] = user.topicsCovered || [];

    const expectedSchema = {
      type: Type.OBJECT,
      properties: {
        reasoning: {
          type: Type.STRING,
          description:
            'Step 1: name 3 excluded topics. Step 2: describe the knowledge frontier. Step 3: explain why your chosen topic is the logical next step.',
        },
        title: {
          type: Type.STRING,
          description:
            'The title of the NEW lesson. Must not match any covered topic or previously rejected suggestion.',
        },
      },
      required: ['reasoning', 'title'],
    };

    const previousBadSuggestions: string[] = [];

    for (let attempt = 1; attempt <= MAX_PLANNER_RETRIES; attempt++) {
      const prompt = AIService.buildPlannerPrompt(
        level,
        domain,
        coveredTopics,
        previousBadSuggestions
      );

      const temperature = 0.5 + attempt * 0.15;

      try {
        const response = await aiClient.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: expectedSchema,
            temperature,
          },
        });

        const text = response.text;
        if (!text) throw new Error('Empty response from AI');

        const parsed = JSON.parse(text) as { reasoning: string; title: string };

        console.log(`\n[Planner] Attempt ${attempt} — Reasoning: ${parsed.reasoning}\n`);

        if (!AIService.isCoveredTopic(parsed.title, coveredTopics)) {
          if (attempt > 1) {
            console.warn(
              `[Planner] Topic "${parsed.title}" validated after ${attempt} attempt(s) for user ${userId}.`
            );
          }
          return parsed.title;
        }
        console.warn(
          `[Planner] Attempt ${attempt}: Suggested covered topic "${parsed.title}". Retrying…`
        );
        previousBadSuggestions.push(parsed.title);
      } catch (error) {

        console.error(`[Planner] AI error on attempt ${attempt} for user ${userId}:`, error);
        throw new AppError('Failed to generate daily essay title', 500);
      }
    }

    throw new AppError(
      `Failed to generate a new topic for user ${userId} after ${MAX_PLANNER_RETRIES} attempts. ` +
        `Rejected suggestions: ${previousBadSuggestions.join(', ')}`,
      500
    );
  }

  static async generateDailyEssayForUser(
    userId: string,
    title: string
  ): Promise<{ title: string; content: string }> {
    const user = await getUserById(userId);

    if (!user) {
      throw new AppError(`User with ID ${userId} not found in the database.`, 400);
    }

    const level = user.currentLevel || 'Beginner';
    const domain = user.domain || 'General Computer Science';
    const coveredTopics: string[] = user.topicsCovered || [];
    const introduction = user.introduction || '';

    let context =
      coveredTopics.length > 0
        ? `The user has already covered these topics: ${coveredTopics.join(', ')}.`
        : `This is the user's very first lesson.`;

    if (coveredTopics.length < 3 && introduction !== '') {
      context += `\nAdditional Context — User's original introduction: "${introduction}"`;
    }

    const prompt = `
      You are an expert technical tutor in ${domain}.
      User Level: ${level}
      Context: ${context}

      Task:
      1. The given topic for this lesson is "${title}".
      2. Write a comprehensive, ~500-word technical essay on this specific topic.
      3. Use strictly clean Markdown formatting (headers, bolding, code blocks).
      4. Code blocks must be language-agnostic (pseudo-code only) — the goal is to teach concepts, not syntax.
      5. Do NOT use emojis. Tone must be strictly semi-formal to formal.
      6. Use real-life analogies wherever they aid understanding.
    `;

    const expectedSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'The title of the lesson' },
        content: { type: Type.STRING, description: 'The full markdown essay' },
      },
      required: ['title', 'content'],
    };

    try {
      const response = await aiClient.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: expectedSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from AI');

      return JSON.parse(text);
    } catch (error) {
      console.error(`[Essay] AI generation error for user ${userId}:`, error);
      throw new AppError('Failed to generate daily essay', 500);
    }
  }
}