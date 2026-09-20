// lib/generateQuestions.js — calls the Gemini API to turn source text into study questions
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const MAX_SOURCE_CHARS = 30000;
const RETRIES_PER_MODEL = 2;
const RETRY_DELAY_MS = 2000;

// Tried in order: if one is overloaded or out of quota, fall back to the next.
// Lighter "lite" models tend to have separate (often less congested) free-tier capacity
// than the flagship flash model, so they're tried first.
const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-flash-lite-latest',
  'gemini-flash-latest'
].filter(Boolean);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isOverloaded(err) {
  const msg = err.message || '';
  return msg.includes('503') || msg.includes('UNAVAILABLE');
}

function isQuotaExhausted(err) {
  const msg = err.message || '';
  return msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
}

async function generateContentWithFallback(genAI, generationConfig, prompt) {
  let lastErr;
  for (const modelName of FALLBACK_MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName, generationConfig });

    for (let attempt = 1; attempt <= RETRIES_PER_MODEL; attempt++) {
      try {
        return await model.generateContent(prompt);
      } catch (err) {
        lastErr = err;
        if (isOverloaded(err) && attempt < RETRIES_PER_MODEL) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        break; // move on to the next model in the fallback list
      }
    }
  }
  if (isOverloaded(lastErr) || isQuotaExhausted(lastErr)) {
    throw new Error('Gemini is currently overloaded or out of free-tier quota on every model tried. Please try again in a few minutes.');
  }
  throw lastErr;
}

const QUESTION_TYPES = ['flashcard', 'multiple_choice', 'situational', 'true_false'];

const TYPE_LABELS = {
  flashcard: 'flashcard (plain question + answer)',
  multiple_choice: 'multiple choice (question + 4 options, one correct answer)',
  situational: 'situational/scenario-based (a short real-world scenario followed by a question about it, common in nursing exams)',
  true_false: 'true/false (a single statement the student judges as true or false)'
};

function buildPrompt({ sourceText, count, types, instructions }) {
  const typeList = types.map(t => TYPE_LABELS[t] || t).join('; ');

  return `You are an expert exam-question writer creating study questions for students (this app is used by nursing students among others) based on the source material below.

Generate exactly ${count} questions total, distributed across these allowed question types: ${typeList}.
If more than one type is allowed, mix them across the ${count} questions rather than using only one type.

${instructions ? `Special instructions from the user: ${instructions}\n` : ''}
Rules:
- Base every question strictly on the source material provided below. Do not invent facts that aren't supported by it.
- For "multiple_choice" questions: provide exactly 4 options in the "options" array, and "answer" must exactly match one of the strings in "options" (word-for-word).
- For "true_false" questions: put the full statement to judge in "question", set "options" to exactly ["True", "False"], and "answer" must be exactly "True" or "False".
- For "flashcard" and "situational" questions: leave "options" empty, and put the full correct answer (or explanation) in "answer".
- For "situational" questions: put the scenario and the question together in the "question" field.
- For every question, also include a "rationale": 1-3 sentences explaining WHY the answer is correct (and briefly why the other options are wrong, for multiple_choice/true_false). This matters a lot — students use it to actually learn, not just memorize the answer.
- Keep questions clear and unambiguous, appropriate for exam review.

Source material:
"""
${sourceText}
"""`;
}

async function generateQuestions({ sourceText, count, types, instructions }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in .env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const generationConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question_type: {
            type: SchemaType.STRING,
            enum: QUESTION_TYPES
          },
          question: { type: SchemaType.STRING },
          answer: { type: SchemaType.STRING },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          rationale: { type: SchemaType.STRING }
        },
        required: ['question_type', 'question', 'answer']
      }
    }
  };

  const truncated = sourceText.slice(0, MAX_SOURCE_CHARS);
  const prompt = buildPrompt({ sourceText: truncated, count, types, instructions });

  const result = await generateContentWithFallback(genAI, generationConfig, prompt);
  const raw = result.response.text();

  let questions;
  try {
    questions = JSON.parse(raw);
  } catch (err) {
    throw new Error('Gemini returned malformed JSON: ' + err.message);
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Gemini did not return any questions.');
  }

  return questions
    .filter(q => q && q.question && q.answer)
    .map(q => {
      const questionType = QUESTION_TYPES.includes(q.question_type) ? q.question_type : 'flashcard';
      let options = null;
      if (questionType === 'true_false') {
        options = ['True', 'False'];
      } else if (questionType === 'multiple_choice' && Array.isArray(q.options)) {
        options = q.options;
      }
      return {
        question_type: questionType,
        question: q.question,
        answer: q.answer,
        options,
        rationale: typeof q.rationale === 'string' && q.rationale.trim() ? q.rationale.trim() : null
      };
    });
}

module.exports = generateQuestions;
module.exports.MAX_SOURCE_CHARS = MAX_SOURCE_CHARS;
module.exports.QUESTION_TYPES = QUESTION_TYPES;
