import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import dns from 'node:dns';

dotenv.config();

// Ensure IPv4 first for reliable connection
try {
  dns.setDefaultResultOrder('ipv4first');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
} catch (e) {}

let genAIClient = null;

const getClient = () => {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[GeminiService] GEMINI_API_KEY not configured.');
    }
    genAIClient = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');
  }
  return genAIClient;
};

const cleanAndParseJSON = (rawText, fallbackData = {}) => {
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
    }
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      }
    } catch (e) {
      console.error('[GeminiService] JSON parse notice:', rawText.slice(0, 150));
    }
    return fallbackData;
  }
};

export const normalizeQuestions = (questions = []) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  return (questions || []).map((q, idx) => {
    let opts = [];
    if (Array.isArray(q.options)) {
      opts = q.options.map((opt, oIdx) => {
        if (typeof opt === 'string') {
          return { id: letters[oIdx] || String(oIdx + 1), text: opt };
        }
        return {
          id: (opt.id || letters[oIdx] || String(oIdx + 1)).toUpperCase(),
          text: opt.text || String(opt),
        };
      });
    }

    let correct = 'A';
    if (q.correctAnswer) {
      const trimmed = String(q.correctAnswer).trim().toUpperCase();
      if (['A', 'B', 'C', 'D', 'E', 'F'].includes(trimmed)) {
        correct = trimmed;
      } else {
        const found = opts.find((o) => o.text.toLowerCase() === trimmed.toLowerCase());
        if (found) correct = found.id;
      }
    }

    return {
      id: q.id || idx + 1,
      number: idx + 1,
      category: q.category || 'Grammar',
      prompt: q.prompt || q.sentence || 'Choose the correct answer:',
      sentence: q.sentence || q.prompt || '',
      options: opts,
      correctAnswer: correct,
      explanation: q.explanation || 'Review standard language rules and syntax.',
    };
  });
};

export const shuffleQuestionOptions = (question) => {
  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    return question;
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const oldCorrectId = String(question.correctAnswer || 'A').toUpperCase().trim();

  // Find the exact correct option text before shuffling
  let correctOption = question.options.find(
    (opt) => String(opt.id || '').toUpperCase().trim() === oldCorrectId
  );
  if (!correctOption) {
    correctOption = question.options[0];
  }
  const correctText = typeof correctOption === 'string' ? correctOption : correctOption.text || String(correctOption);

  // Extract all option texts
  const optionTexts = question.options.map((opt) =>
    typeof opt === 'string' ? opt : opt.text || String(opt)
  );

  // Non-predictable Fisher-Yates shuffle
  for (let i = optionTexts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionTexts[i], optionTexts[j]] = [optionTexts[j], optionTexts[i]];
  }

  // Re-assign new option letters and locate new correct letter
  let newCorrectLetter = 'A';
  const newOptions = optionTexts.map((text, idx) => {
    const letter = letters[idx] || String(idx + 1);
    if (text === correctText) {
      newCorrectLetter = letter;
    }
    return {
      id: letter,
      text: text,
    };
  });

  return {
    ...question,
    options: newOptions,
    correctAnswer: newCorrectLetter,
  };
};

const getModel = (modelName = 'gemini-2.5-flash') => {
  const client = getClient();
  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      responseMimeType: 'application/json',
    },
  });
};

// ==========================================
// 1. GRAMMAR EXERCISE GENERATOR
// ==========================================
const TOPIC_FALLBACKS = {
  'Present Simple': [
    {
      prompt: 'Choose the correct verb form for habitual action:',
      sentence: 'She _____ to the university library every weekday.',
      options: [
        { id: 'A', text: 'go' },
        { id: 'B', text: 'goes' },
        { id: 'C', text: 'is going' },
        { id: 'D', text: 'gone' },
      ],
      correctAnswer: 'B',
      explanation: 'With third-person singular subjects (he/she/it), add -s or -es to the base verb in the Present Simple.',
    },
    {
      prompt: 'Select the correct negative auxiliary verb:',
      sentence: 'They _____ drink coffee in the late evening.',
      options: [
        { id: 'A', text: "doesn't" },
        { id: 'B', text: "don't" },
        { id: 'C', text: "aren't" },
        { id: 'D', text: "haven't" },
      ],
      correctAnswer: 'B',
      explanation: "Use the auxiliary 'do not' ('don't') with plural subjects like 'They' in the Present Simple.",
    },
    {
      prompt: 'Choose the correct question form:',
      sentence: '_____ your brother live in London or Manchester?',
      options: [
        { id: 'A', text: 'Do' },
        { id: 'B', text: 'Does' },
        { id: 'C', text: 'Is' },
        { id: 'D', text: 'Are' },
      ],
      correctAnswer: 'B',
      explanation: "Use 'Does' as the auxiliary for third-person singular questions in the Present Simple.",
    },
    {
      prompt: 'Select the correct verb for a scientific fact:',
      sentence: 'Water _____ at 100 degrees Celsius under normal atmospheric pressure.',
      options: [
        { id: 'A', text: 'boil' },
        { id: 'B', text: 'boils' },
        { id: 'C', text: 'is boiling' },
        { id: 'D', text: 'boiled' },
      ],
      correctAnswer: 'B',
      explanation: "Scientific facts and universal truths are expressed using the Present Simple with singular verb inflection ('boils').",
    },
    {
      prompt: 'Choose the correct question word order:',
      sentence: 'How often _____ to the gym each week?',
      options: [
        { id: 'A', text: 'do you go' },
        { id: 'B', text: 'are you go' },
        { id: 'C', text: 'you go' },
        { id: 'D', text: 'does you go' },
      ],
      correctAnswer: 'A',
      explanation: "Form present simple questions with: Question Word + do/does + subject + base verb ('do you go').",
    },
    {
      prompt: 'Select the correct verb for a scheduled timetable:',
      sentence: 'The morning express train _____ at exactly 8:30 AM tomorrow.',
      options: [
        { id: 'A', text: 'leaves' },
        { id: 'B', text: 'is leave' },
        { id: 'C', text: 'left' },
        { id: 'D', text: 'leaving' },
      ],
      correctAnswer: 'A',
      explanation: 'Use the Present Simple to talk about scheduled timetables and transportation itineraries.',
    },
    {
      prompt: 'Choose the correct stative verb form:',
      sentence: 'I _____ that regular exercise improves mental well-being.',
      options: [
        { id: 'A', text: 'am believing' },
        { id: 'B', text: 'believe' },
        { id: 'C', text: 'believes' },
        { id: 'D', text: 'believed' },
      ],
      correctAnswer: 'B',
      explanation: 'Stative verbs of opinion and belief (such as believe) are typically used in the simple present.',
    },
    {
      prompt: 'Select the correct adverb of frequency placement:',
      sentence: 'He _____ on time for his morning lectures.',
      options: [
        { id: 'A', text: 'is always' },
        { id: 'B', text: 'always is' },
        { id: 'C', text: 'always be' },
        { id: 'D', text: 'is always being' },
      ],
      correctAnswer: 'A',
      explanation: 'Adverbs of frequency (always, usually, never) follow the verb "to be" in affirmative sentences.',
    },
    {
      prompt: 'Choose the correct third-person singular negative:',
      sentence: 'David _____ eat shellfish due to severe allergies.',
      options: [
        { id: 'A', text: "doesn't" },
        { id: 'B', text: "don't" },
        { id: 'C', text: "isn't" },
        { id: 'D', text: "hasn't" },
      ],
      correctAnswer: 'A',
      explanation: 'Use "does not" ("doesn\'t") with third-person singular subjects like David.',
    },
    {
      prompt: 'Select the correct universal truth statement:',
      sentence: 'The Earth _____ around the Sun in an elliptical path.',
      options: [
        { id: 'A', text: 'revolve' },
        { id: 'B', text: 'revolves' },
        { id: 'C', text: 'is revolving' },
        { id: 'D', text: 'revolved' },
      ],
      correctAnswer: 'B',
      explanation: 'Universal astronomical facts are stated in the simple present with third-person singular -s.',
    },
    {
      prompt: 'Choose the correct plural routine verb:',
      sentence: 'My grandparents _____ a walk in the botanical garden every evening.',
      options: [
        { id: 'A', text: 'takes' },
        { id: 'B', text: 'take' },
        { id: 'C', text: 'are taking' },
        { id: 'D', text: 'taken' },
      ],
      correctAnswer: 'B',
      explanation: 'Plural subjects ("My grandparents") use the base form of the verb in Present Simple.',
    },
    {
      prompt: 'Select the correct question auxiliary for plural subjects:',
      sentence: 'Where _____ your colleagues usually have their team lunch?',
      options: [
        { id: 'A', text: 'does' },
        { id: 'B', text: 'do' },
        { id: 'C', text: 'are' },
        { id: 'D', text: 'is' },
      ],
      correctAnswer: 'B',
      explanation: 'Use auxiliary "do" for questions with plural subjects ("your colleagues").',
    },
    {
      prompt: 'Choose the correct preference verb:',
      sentence: 'Professor Harris _____ tea over roasted coffee.',
      options: [
        { id: 'A', text: 'prefer' },
        { id: 'B', text: 'prefers' },
        { id: 'C', text: 'is preferring' },
        { id: 'D', text: 'preferred' },
      ],
      correctAnswer: 'B',
      explanation: 'Preference verbs are stative and take -s for singular third-person subjects.',
    },
    {
      prompt: 'Select the correct spelling for consonant + y verb inflection:',
      sentence: 'The newborn baby _____ whenever she feels uncomfortable.',
      options: [
        { id: 'A', text: 'crys' },
        { id: 'B', text: 'cries' },
        { id: 'C', text: 'is crying' },
        { id: 'D', text: 'cry' },
      ],
      correctAnswer: 'B',
      explanation: 'Verbs ending in consonant + y change "y" to "ies" in third-person singular (cry -> cries).',
    },
    {
      prompt: 'Choose the correct question with "have":',
      sentence: '_____ you have all the required documents for the visa application?',
      options: [
        { id: 'A', text: 'Do' },
        { id: 'B', text: 'Have' },
        { id: 'C', text: 'Are' },
        { id: 'D', text: 'Does' },
      ],
      correctAnswer: 'A',
      explanation: 'Use auxiliary "Do" to form questions with the main verb "have" in standard modern English.',
    },
  ],
  'Present Continuous': [
    {
      prompt: 'Select the correct sentence describing an action happening now:',
      sentence: 'Listen! Someone _____ at the front door right now.',
      options: [
        { id: 'A', text: 'knocks' },
        { id: 'B', text: 'is knocking' },
        { id: 'C', text: 'are knocking' },
        { id: 'D', text: 'knock' },
      ],
      correctAnswer: 'B',
      explanation: "Use 'is + verb-ing' for singular actions taking place at the moment of speech.",
    },
    {
      prompt: 'Choose the correct negative form:',
      sentence: 'We _____ television at the moment; we are preparing dinner.',
      options: [
        { id: 'A', text: "aren't watching" },
        { id: 'B', text: "don't watching" },
        { id: 'C', text: "isn't watching" },
        { id: 'D', text: "not watch" },
      ],
      correctAnswer: 'A',
      explanation: "The negative present continuous for 'We' is 'are not' ('aren't') + present participle.",
    },
    {
      prompt: 'Choose the correct question form:',
      sentence: 'Why _____ an umbrella today? Is it raining outside?',
      options: [
        { id: 'A', text: 'do you carry' },
        { id: 'B', text: 'are you carrying' },
        { id: 'C', text: 'you are carrying' },
        { id: 'D', text: 'have you carry' },
      ],
      correctAnswer: 'B',
      explanation: "Form present continuous questions with 'am/is/are + subject + verb-ing'.",
    },
    {
      prompt: 'Complete with the correct continuous verb:',
      sentence: 'Look! The children _____ peacefully in the garden.',
      options: [
        { id: 'A', text: 'plays' },
        { id: 'B', text: 'is playing' },
        { id: 'C', text: 'are playing' },
        { id: 'D', text: 'played' },
      ],
      correctAnswer: 'C',
      explanation: "'The children' is a plural noun, requiring the auxiliary 'are' + verb-ing ('are playing').",
    },
    {
      prompt: 'Choose the sentence expressing a temporary situation:',
      sentence: 'My brother _____ for his semester exams this entire week.',
      options: [
        { id: 'A', text: 'studies' },
        { id: 'B', text: 'is studying' },
        { id: 'C', text: 'study' },
        { id: 'D', text: 'has study' },
      ],
      correctAnswer: 'B',
      explanation: "Present continuous is used for temporary situations in progress around the present time ('this week').",
    },
    {
      prompt: 'Select the verb for a changing/developing trend:',
      sentence: 'Global average temperatures _____ steadily over recent decades.',
      options: [
        { id: 'A', text: 'are rising' },
        { id: 'B', text: 'rise' },
        { id: 'C', text: 'is rising' },
        { id: 'D', text: 'have rise' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Present Continuous to describe evolving or gradual processes and changes.',
    },
    {
      prompt: 'Choose the verb for a fixed near-future appointment:',
      sentence: 'We _____ the marketing director tomorrow afternoon at two.',
      options: [
        { id: 'A', text: 'meet' },
        { id: 'B', text: 'are meeting' },
        { id: 'C', text: 'were meeting' },
        { id: 'D', text: 'met' },
      ],
      correctAnswer: 'B',
      explanation: 'Present Continuous expresses pre-arranged personal appointments and fixed plans in the near future.',
    },
    {
      prompt: 'Select the action in active progress:',
      sentence: 'The engineers _____ the main server cables at this very moment.',
      options: [
        { id: 'A', text: 'repair' },
        { id: 'B', text: 'are repairing' },
        { id: 'C', text: 'repairs' },
        { id: 'D', text: 'is repairing' },
      ],
      correctAnswer: 'B',
      explanation: 'Plural subject ("The engineers") takes "are + verb-ing" for ongoing activities.',
    },
    {
      prompt: 'Express an annoying repeated habit with "always":',
      sentence: 'He _____ his phone during quiet work hours.',
      options: [
        { id: 'A', text: 'is always checking' },
        { id: 'B', text: 'always check' },
        { id: 'C', text: 'checks always' },
        { id: 'D', text: 'has always checked' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "be + always + verb-ing" to emphasize irritation at someone\'s frequent habits.',
    },
    {
      prompt: 'Choose the correct negative singular continuous form:',
      sentence: 'Clara _____ to the podcast right now; she is on a video conference.',
      options: [
        { id: 'A', text: "isn't listening" },
        { id: 'B', text: "doesn't listening" },
        { id: 'C', text: "aren't listening" },
        { id: 'D', text: "not listens" },
      ],
      correctAnswer: 'A',
      explanation: 'Use "is not" ("isn\'t") + verb-ing with singular subject Clara.',
    },
    {
      prompt: 'Select the question asking about current speech:',
      sentence: 'Who _____ the keynote address in the main auditorium right now?',
      options: [
        { id: 'A', text: 'delivers' },
        { id: 'B', text: 'is delivering' },
        { id: 'C', text: 'are delivering' },
        { id: 'D', text: 'delivered' },
      ],
      correctAnswer: 'B',
      explanation: 'Subject question with "Who" as singular takes "is delivering" for current actions.',
    },
    {
      prompt: 'Choose the verb describing an ongoing market trend:',
      sentence: 'More consumers _____ eco-friendly products this season.',
      options: [
        { id: 'A', text: 'are purchasing' },
        { id: 'B', text: 'purchases' },
        { id: 'C', text: 'is purchasing' },
        { id: 'D', text: 'purchased' },
      ],
      correctAnswer: 'A',
      explanation: 'Plural subject ("More consumers") requires "are purchasing" for contemporary trends.',
    },
    {
      prompt: 'Select the temporary residency verb:',
      sentence: 'I _____ with my brother while my new apartment is being painted.',
      options: [
        { id: 'A', text: 'am staying' },
        { id: 'B', text: 'stay' },
        { id: 'C', text: 'stayed' },
        { id: 'D', text: 'am stayed' },
      ],
      correctAnswer: 'A',
      explanation: 'Temporary living arrangements are described with "am staying" in Present Continuous.',
    },
    {
      prompt: 'Complete parallel simultaneous actions:',
      sentence: 'While Alex is cooking dinner, Maria _____ the conference room.',
      options: [
        { id: 'A', text: 'prepares' },
        { id: 'B', text: 'is preparing' },
        { id: 'C', text: 'prepared' },
        { id: 'D', text: 'has prepared' },
      ],
      correctAnswer: 'B',
      explanation: 'Use Present Continuous in both parallel clauses to describe simultaneous actions in progress.',
    },
    {
      prompt: 'Choose the correct question word order in continuous:',
      sentence: 'What _____ on the blackboard right now?',
      options: [
        { id: 'A', text: 'is the teacher writing' },
        { id: 'B', text: 'the teacher is writing' },
        { id: 'C', text: 'does the teacher write' },
        { id: 'D', text: 'is writing the teacher' },
      ],
      correctAnswer: 'A',
      explanation: 'Question structure: Question word + is/are + subject + verb-ing.',
    },
  ],
  'Present Perfect': [
    {
      prompt: 'Complete the sentence with the correct Present Perfect form:',
      sentence: 'I _____ this documentary three times already.',
      options: [
        { id: 'A', text: 'saw' },
        { id: 'B', text: 'have seen' },
        { id: 'C', text: 'am seeing' },
        { id: 'D', text: 'see' },
      ],
      correctAnswer: 'B',
      explanation: "Present Perfect ('have seen') expresses an experience occurring before now with 'already'.",
    },
    {
      prompt: 'Select the correct time preposition for duration:',
      sentence: 'She has worked at the medical research institute _____ five years.',
      options: [
        { id: 'A', text: 'since' },
        { id: 'B', text: 'for' },
        { id: 'C', text: 'during' },
        { id: 'D', text: 'from' },
      ],
      correctAnswer: 'B',
      explanation: "Use 'for' to indicate a period or duration of time (five years), whereas 'since' marks a specific starting point.",
    },
    {
      prompt: 'Choose the correct question with "yet":',
      sentence: '_____ your homework yet? We need to leave soon.',
      options: [
        { id: 'A', text: 'Did you finish' },
        { id: 'B', text: 'Have you finished' },
        { id: 'C', text: 'Were you finishing' },
        { id: 'D', text: 'Do you finish' },
      ],
      correctAnswer: 'B',
      explanation: "Use 'Have + subject + past participle' with 'yet' in questions asking about completion.",
    },
    {
      prompt: 'Select the correct form describing life experience:',
      sentence: 'They _____ to Japan, but they plan to travel there next summer.',
      options: [
        { id: 'A', text: 'have never been' },
        { id: 'B', text: 'never went' },
        { id: 'C', text: 'have ever gone' },
        { id: 'D', text: 'had never be' },
      ],
      correctAnswer: 'A',
      explanation: "Use 'have never been' to express life experience up to the present moment.",
    },
    {
      prompt: 'Select the correct preposition for a starting point in time:',
      sentence: 'David has lived in Chicago _____ 2018.',
      options: [
        { id: 'A', text: 'for' },
        { id: 'B', text: 'since' },
        { id: 'C', text: 'during' },
        { id: 'D', text: 'in' },
      ],
      correctAnswer: 'B',
      explanation: "Use 'since' with a specific starting year or date (2018) in Present Perfect sentences.",
    },
    {
      prompt: 'Select the verb with "just" for recent completion:',
      sentence: 'The flight from London _____ on runway four.',
      options: [
        { id: 'A', text: 'has just landed' },
        { id: 'B', text: 'just landed' },
        { id: 'C', text: 'is just landing' },
        { id: 'D', text: 'had just land' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Present Perfect ("has just landed") to highlight a very recent completed event.',
    },
    {
      prompt: 'Choose the verb for an unfinished time period (today):',
      sentence: 'I _____ three cups of green tea this morning.',
      options: [
        { id: 'A', text: 'have drunk' },
        { id: 'B', text: 'drank' },
        { id: 'C', text: 'am drinking' },
        { id: 'D', text: 'drink' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Present Perfect when the time period ("this morning") is still ongoing at the moment of speech.',
    },
    {
      prompt: 'Select the question inquiring about lifetime experience:',
      sentence: '_____ you ever eaten authentic Peruvian cuisine?',
      options: [
        { id: 'A', text: 'Have' },
        { id: 'B', text: 'Did' },
        { id: 'C', text: 'Do' },
        { id: 'D', text: 'Were' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "Have + subject + ever + past participle" to ask about general life experiences.',
    },
    {
      prompt: 'Complete the sentence with superlative + Present Perfect:',
      sentence: 'This is the most challenging puzzle I _____ .',
      options: [
        { id: 'A', text: 'have ever solved' },
        { id: 'B', text: 'ever solved' },
        { id: 'C', text: 'am ever solving' },
        { id: 'D', text: 'had solved' },
      ],
      correctAnswer: 'A',
      explanation: 'Superlative adjectives are followed by Present Perfect ("have ever solved") to evaluate lifetime experience.',
    },
    {
      prompt: 'Choose the verb for state continuing from the past:',
      sentence: 'We _____ close friends since our first year of university.',
      options: [
        { id: 'A', text: 'have been' },
        { id: 'B', text: 'were' },
        { id: 'C', text: 'are being' },
        { id: 'D', text: 'had been' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "have been" to describe a state that began in the past and continues into the present.',
    },
    {
      prompt: 'Select the repeated action up to now:',
      sentence: 'She _____ the certification exam twice this year.',
      options: [
        { id: 'A', text: 'has taken' },
        { id: 'B', text: 'took' },
        { id: 'C', text: 'is taking' },
        { id: 'D', text: 'takes' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Present Perfect ("has taken") for actions repeated an unspecified number of times up to the present.',
    },
    {
      prompt: 'Choose the negative form with "yet":',
      sentence: 'The courier service _____ the package yet.',
      options: [
        { id: 'A', text: "hasn't delivered" },
        { id: 'B', text: "didn't deliver" },
        { id: 'C', text: "doesn't deliver" },
        { id: 'D', text: "isn't delivering" },
      ],
      correctAnswer: 'A',
      explanation: 'Negative Present Perfect ("hasn\'t delivered") is paired with "yet" at the end of clauses.',
    },
    {
      prompt: 'Select the progress marker with "so far":',
      sentence: 'Our team _____ four modules of the software so far.',
      options: [
        { id: 'A', text: 'has completed' },
        { id: 'B', text: 'completed' },
        { id: 'C', text: 'completes' },
        { id: 'D', text: 'had completed' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Present Perfect ("has completed") with time expression "so far".',
    },
    {
      prompt: 'Choose the correct question form for number of times:',
      sentence: 'How many times _____ the Louvre Museum in Paris?',
      options: [
        { id: 'A', text: 'have you visited' },
        { id: 'B', text: 'did you visit' },
        { id: 'C', text: 'do you visit' },
        { id: 'D', text: 'were you visiting' },
      ],
      correctAnswer: 'A',
      explanation: 'Ask "How many times have you visited..." when the time period extends to the present.',
    },
    {
      prompt: 'Select the duration verb up to present:',
      sentence: 'The historical library _____ open to researchers for centuries.',
      options: [
        { id: 'A', text: 'has remained' },
        { id: 'B', text: 'remained' },
        { id: 'C', text: 'remains' },
        { id: 'D', text: 'is remaining' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Present Perfect ("has remained") with "for centuries" indicating duration continuing to today.',
    },
  ],
  'Past Simple & Continuous': [
    {
      prompt: 'Choose the correct interrupted past action:',
      sentence: 'While I _____ for the bus, it suddenly started to rain heavily.',
      options: [
        { id: 'A', text: 'waited' },
        { id: 'B', text: 'was waiting' },
        { id: 'C', text: 'am waiting' },
        { id: 'D', text: 'have waited' },
      ],
      correctAnswer: 'B',
      explanation: "Use the Past Continuous ('was waiting') for a longer background action interrupted by a shorter Past Simple event.",
    },
    {
      prompt: 'Select the correct Past Simple verb for a finished event:',
      sentence: 'Yesterday afternoon, Sarah _____ her keys and could not enter the apartment.',
      options: [
        { id: 'A', text: 'lost' },
        { id: 'B', text: 'was losing' },
        { id: 'C', text: 'has lost' },
        { id: 'D', text: 'loses' },
      ],
      correctAnswer: 'A',
      explanation: "Use the Past Simple ('lost') for a completed action at a specific time in the past ('yesterday afternoon').",
    },
    {
      prompt: 'Choose the correct continuous past question:',
      sentence: 'What _____ when the earthquake shook the building?',
      options: [
        { id: 'A', text: 'did you do' },
        { id: 'B', text: 'were you doing' },
        { id: 'C', text: 'have you done' },
        { id: 'D', text: 'do you do' },
      ],
      correctAnswer: 'B',
      explanation: "Use Past Continuous ('were you doing') to ask about an activity in progress at a specific past moment.",
    },
    {
      prompt: 'Select the correct verb for the interrupting event:',
      sentence: 'He was driving home when a deer _____ across the dark road.',
      options: [
        { id: 'A', text: 'ran' },
        { id: 'B', text: 'was running' },
        { id: 'C', text: 'has run' },
        { id: 'D', text: 'runs' },
      ],
      correctAnswer: 'A',
      explanation: "The interrupting event is expressed in the Past Simple ('ran').",
    },
    {
      prompt: 'Complete the background action:',
      sentence: 'We _____ dinner when the electricity went out.',
      options: [
        { id: 'A', text: 'had' },
        { id: 'B', text: 'were having' },
        { id: 'C', text: 'have had' },
        { id: 'D', text: 'are having' },
      ],
      correctAnswer: 'B',
      explanation: "'Were having' describes the ongoing past background activity when the power cut occurred.",
    },
    {
      prompt: 'Select the sequence of completed past actions:',
      sentence: 'She unlocked the door, _____ on the lamp, and sat down at her desk.',
      options: [
        { id: 'A', text: 'switched' },
        { id: 'B', text: 'was switching' },
        { id: 'C', text: 'has switched' },
        { id: 'D', text: 'switch' },
      ],
      correctAnswer: 'A',
      explanation: 'Use a series of Past Simple verbs (unlocked, switched, sat) for chronological actions in the past.',
    },
    {
      prompt: 'Choose the finished past event with a specific year:',
      sentence: 'The research institute _____ the clinical trial in 2019.',
      options: [
        { id: 'A', text: 'conducted' },
        { id: 'B', text: 'has conducted' },
        { id: 'C', text: 'was conducting' },
        { id: 'D', text: 'conducts' },
      ],
      correctAnswer: 'A',
      explanation: 'Specific past time expressions like "in 2019" strictly require the Past Simple.',
    },
    {
      prompt: 'Complete parallel continuous past actions:',
      sentence: 'While Arthur was reading notes, his colleague _____ the presentation slides.',
      options: [
        { id: 'A', text: 'was preparing' },
        { id: 'B', text: 'prepared' },
        { id: 'C', text: 'prepares' },
        { id: 'D', text: 'has prepared' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Past Continuous in both clauses for two ongoing simultaneous past actions joined by "while".',
    },
    {
      prompt: 'Choose the negative Past Simple auxiliary:',
      sentence: 'They _____ the announcement because the loudspeaker was broken.',
      options: [
        { id: 'A', text: "didn't hear" },
        { id: 'B', text: "weren't heard" },
        { id: 'C', text: "haven't heard" },
        { id: 'D', text: "didn't heard" },
      ],
      correctAnswer: 'A',
      explanation: 'Negative Past Simple uses "did not" ("didn\'t") + base verb ("hear").',
    },
    {
      prompt: 'Select the past question auxiliary:',
      sentence: 'Where _____ you spend your summer vacation two years ago?',
      options: [
        { id: 'A', text: 'did' },
        { id: 'B', text: 'were' },
        { id: 'C', text: 'have' },
        { id: 'D', text: 'do' },
      ],
      correctAnswer: 'A',
      explanation: 'Form past simple questions with "did + subject + base verb".',
    },
    {
      prompt: 'Select the past weather condition in progress:',
      sentence: 'It _____ heavily when the rescue helicopters arrived.',
      options: [
        { id: 'A', text: 'was snowing' },
        { id: 'B', text: 'snowed' },
        { id: 'C', text: 'is snowing' },
        { id: 'D', text: 'snows' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Past Continuous ("was snowing") for background meteorological conditions.',
    },
    {
      prompt: 'Choose the sudden past perception verb:',
      sentence: 'While strolling through the antique market, he _____ a rare painting.',
      options: [
        { id: 'A', text: 'spotted' },
        { id: 'B', text: 'was spotting' },
        { id: 'C', text: 'has spotted' },
        { id: 'D', text: 'spots' },
      ],
      correctAnswer: 'A',
      explanation: 'Sudden events or discoveries interrupting a continuous activity use the Past Simple ("spotted").',
    },
    {
      prompt: 'Select the continuous question form in past:',
      sentence: '_____ on that research proposal when your laptop lost power?',
      options: [
        { id: 'A', text: 'Were you working' },
        { id: 'B', text: 'Did you work' },
        { id: 'C', text: 'Have you worked' },
        { id: 'D', text: 'Are you working' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "Were you + verb-ing" to inquire about an ongoing past activity.',
    },
    {
      prompt: 'Select the completed past routine:',
      sentence: 'During her childhood, Elena _____ the piano for an hour every afternoon.',
      options: [
        { id: 'A', text: 'practiced' },
        { id: 'B', text: 'was practiced' },
        { id: 'C', text: 'has practiced' },
        { id: 'D', text: 'is practicing' },
      ],
      correctAnswer: 'A',
      explanation: 'Use the Past Simple ("practiced") for past routines and habits that are no longer true.',
    },
    {
      prompt: 'Choose the interrupting phone call verb:',
      sentence: 'The telephone rang loudly while the manager _____ the confidential report.',
      options: [
        { id: 'A', text: 'was drafting' },
        { id: 'B', text: 'drafted' },
        { id: 'C', text: 'drafts' },
        { id: 'D', text: 'has drafted' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Past Continuous ("was drafting") for the background task in progress when the call came in.',
    },
  ],
  'Future Forms & Modals': [
    {
      prompt: 'Select the prediction based on present evidence:',
      sentence: 'Look at those dark clouds! It _____ rain very soon.',
      options: [
        { id: 'A', text: 'will' },
        { id: 'B', text: 'is going to' },
        { id: 'C', text: 'might to' },
        { id: 'D', text: 'shall' },
      ],
      correctAnswer: 'B',
      explanation: "Use 'be going to' when making a prediction based on present, visible evidence (dark clouds).",
    },
    {
      prompt: 'Choose the modal expressing legal obligation:',
      sentence: 'You _____ wear a helmet when riding a motorcycle by law.',
      options: [
        { id: 'A', text: 'might' },
        { id: 'B', text: 'must' },
        { id: 'C', text: 'could' },
        { id: 'D', text: 'would' },
      ],
      correctAnswer: 'B',
      explanation: "The modal 'must' expresses strong legal obligation or requirement.",
    },
    {
      prompt: 'Select the future prediction based on belief:',
      sentence: 'I think people _____ more electric vehicles in the next decade.',
      options: [
        { id: 'A', text: 'will drive' },
        { id: 'B', text: 'are driving' },
        { id: 'C', text: 'must to drive' },
        { id: 'D', text: 'drove' },
      ],
      correctAnswer: 'A',
      explanation: "Use 'will + verb' for general predictions, beliefs, or opinions about the future.",
    },
    {
      prompt: 'Choose the modal for a polite request:',
      sentence: '_____ you please pass me the salt from the counter?',
      options: [
        { id: 'A', text: 'Should' },
        { id: 'B', text: 'Could' },
        { id: 'C', text: 'Must' },
        { id: 'D', text: 'Shall' },
      ],
      correctAnswer: 'B',
      explanation: "'Could' is used for making polite, courteous requests.",
    },
    {
      prompt: 'Select the modal expressing strict prohibition:',
      sentence: 'Students _____ talk during the final examination.',
      options: [
        { id: 'A', text: 'must not' },
        { id: 'B', text: "don't have to" },
        { id: 'C', text: 'might not' },
        { id: 'D', text: "needn't" },
      ],
      correctAnswer: 'A',
      explanation: "'Must not' expresses prohibition (it is strictly forbidden to talk during exams).",
    },
    {
      prompt: 'Choose the verb for a prior planned intention:',
      sentence: 'Next month, I _____ a certified course in artificial intelligence.',
      options: [
        { id: 'A', text: 'am going to start' },
        { id: 'B', text: 'start' },
        { id: 'C', text: 'started' },
        { id: 'D', text: 'must start' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "be going to" for personal plans and intentions decided before the moment of speaking.',
    },
    {
      prompt: 'Select the spontaneous decision made at the moment of speech:',
      sentence: 'The doorbell is ringing. I _____ and answer it.',
      options: [
        { id: 'A', text: 'will go' },
        { id: 'B', text: 'am going to go' },
        { id: 'C', text: 'go' },
        { id: 'D', text: 'shall be gone' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "will + base verb" for spontaneous decisions made right at the moment of speaking.',
    },
    {
      prompt: 'Choose the modal for logical deduction/certainty:',
      sentence: 'He has worked for fourteen straight hours; he _____ be exhausted.',
      options: [
        { id: 'A', text: 'must' },
        { id: 'B', text: 'can' },
        { id: 'C', text: 'might not' },
        { id: 'D', text: 'shall' },
      ],
      correctAnswer: 'A',
      explanation: 'Use modal "must" to express a strong logical deduction based on clear evidence.',
    },
    {
      prompt: 'Select the modal expressing absence of obligation:',
      sentence: 'Tomorrow is a national holiday, so we _____ attend the office.',
      options: [
        { id: 'A', text: "don't have to" },
        { id: 'B', text: 'must not' },
        { id: 'C', text: "couldn't" },
        { id: 'D', text: 'might not' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "don\'t have to" when an action is unnecessary (no obligation).',
    },
    {
      prompt: 'Choose the modal for recommendation/advice:',
      sentence: 'You look exhausted from travelling; you _____ get some rest.',
      options: [
        { id: 'A', text: 'should' },
        { id: 'B', text: 'would' },
        { id: 'C', text: 'shall' },
        { id: 'D', text: 'must to' },
      ],
      correctAnswer: 'A',
      explanation: 'The modal "should" is used to offer friendly advice or recommendations.',
    },
    {
      prompt: 'Select the modal expressing possibility:',
      sentence: 'Take a raincoat with you; it _____ drizzle later this evening.',
      options: [
        { id: 'A', text: 'might' },
        { id: 'B', text: 'must' },
        { id: 'C', text: 'should to' },
        { id: 'D', text: 'would' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "might" or "may" to express uncertain future possibilities.',
    },
    {
      prompt: 'Choose the polite formal offer modal:',
      sentence: '_____ I assist you with those heavy conference folders?',
      options: [
        { id: 'A', text: 'Shall' },
        { id: 'B', text: 'Will' },
        { id: 'C', text: 'Must' },
        { id: 'D', text: 'Would' },
      ],
      correctAnswer: 'A',
      explanation: '"Shall I...?" is standard formal English for making polite offers.',
    },
    {
      prompt: 'Select the scheduled future timetable verb:',
      sentence: 'The international flight to Tokyo _____ at 07:15 tomorrow morning.',
      options: [
        { id: 'A', text: 'departs' },
        { id: 'B', text: 'is departing' },
        { id: 'C', text: 'will depart' },
        { id: 'D', text: 'departed' },
      ],
      correctAnswer: 'A',
      explanation: 'Official timetables and transport schedules use the Simple Present for future events.',
    },
    {
      prompt: 'Choose the future continuous action in progress:',
      sentence: 'This time next week, we _____ on a peaceful tropical beach.',
      options: [
        { id: 'A', text: 'will be relaxing' },
        { id: 'B', text: 'will relax' },
        { id: 'C', text: 'relax' },
        { id: 'D', text: 'are relaxed' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Future Continuous ("will be + verb-ing") for an action that will be in progress at a specific future time.',
    },
    {
      prompt: 'Select the modal for past ability:',
      sentence: 'By the time she was six years old, she _____ speak three languages fluently.',
      options: [
        { id: 'A', text: 'could' },
        { id: 'B', text: 'can' },
        { id: 'C', text: 'might' },
        { id: 'D', text: 'should' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "could" to express general ability in the past.',
    },
  ],
  'Conditionals (0, 1, 2, 3)': [
    {
      prompt: 'Complete the Zero Conditional sentence for a scientific fact:',
      sentence: 'If you heat ice, it _____ into water.',
      options: [
        { id: 'A', text: 'melts' },
        { id: 'B', text: 'will melt' },
        { id: 'C', text: 'melted' },
        { id: 'D', text: 'would melt' },
      ],
      correctAnswer: 'A',
      explanation: "Zero conditional uses Simple Present in both clauses to express universal scientific facts (If + present, present).",
    },
    {
      prompt: 'Complete the First Conditional for a real future possibility:',
      sentence: 'If it rains tomorrow, we _____ the outdoor picnic.',
      options: [
        { id: 'A', text: 'cancel' },
        { id: 'B', text: 'will cancel' },
        { id: 'C', text: 'would cancel' },
        { id: 'D', text: 'canceled' },
      ],
      correctAnswer: 'B',
      explanation: "First conditional uses: If + Simple Present ('rains'), 'will + base verb' ('will cancel') for realistic future possibilities.",
    },
    {
      prompt: 'Complete the Second Conditional for an imaginary situation:',
      sentence: 'If I won a million dollars, I _____ around the world.',
      options: [
        { id: 'A', text: 'will travel' },
        { id: 'B', text: 'would travel' },
        { id: 'C', text: 'traveled' },
        { id: 'D', text: 'travel' },
      ],
      correctAnswer: 'B',
      explanation: "Second conditional uses: If + Past Simple ('won'), 'would + base verb' ('would travel') for hypothetical present/future situations.",
    },
    {
      prompt: 'Complete the Third Conditional for an unreal past event:',
      sentence: 'If she had studied harder, she _____ the difficult exam.',
      options: [
        { id: 'A', text: 'would pass' },
        { id: 'B', text: 'would have passed' },
        { id: 'C', text: 'will have passed' },
        { id: 'D', text: 'had passed' },
      ],
      correctAnswer: 'B',
      explanation: "Third conditional uses: If + Past Perfect ('had studied'), 'would have + past participle' ('would have passed') for unreal past situations.",
    },
    {
      prompt: 'Choose the correct subjunctive form for advice:',
      sentence: 'If I _____ you, I would consult a doctor immediately.',
      options: [
        { id: 'A', text: 'am' },
        { id: 'B', text: 'were' },
        { id: 'C', text: 'was to be' },
        { id: 'D', text: 'have been' },
      ],
      correctAnswer: 'B',
      explanation: "Use the subjunctive 'were' with all subjects (If I were you) in Second Conditional advice.",
    },
    {
      prompt: 'Complete the Zero Conditional for routine consequence:',
      sentence: 'When plants do not receive sunlight, they _____ to thrive.',
      options: [
        { id: 'A', text: 'cease' },
        { id: 'B', text: 'will cease' },
        { id: 'C', text: 'ceased' },
        { id: 'D', text: 'would cease' },
      ],
      correctAnswer: 'A',
      explanation: 'Zero conditional uses present simple in both clauses for universal biological rules.',
    },
    {
      prompt: 'Select the First Conditional with "unless":',
      sentence: 'We will miss the flight unless we _____ immediately.',
      options: [
        { id: 'A', text: 'leave' },
        { id: 'B', text: 'will leave' },
        { id: 'C', text: 'left' },
        { id: 'D', text: 'would leave' },
      ],
      correctAnswer: 'A',
      explanation: 'The clause after "unless" takes the Simple Present tense in first conditional sentences.',
    },
    {
      prompt: 'Choose the Second Conditional question form:',
      sentence: 'What _____ if you lost your passport in a foreign country?',
      options: [
        { id: 'A', text: 'would you do' },
        { id: 'B', text: 'will you do' },
        { id: 'C', text: 'did you do' },
        { id: 'D', text: 'do you do' },
      ],
      correctAnswer: 'A',
      explanation: 'Form hypothetical questions with "would + subject + base verb" with past simple in the if-clause.',
    },
    {
      prompt: 'Complete Third Conditional with ability modal:',
      sentence: 'If we had arrived ten minutes earlier, we _____ the keynote speaker.',
      options: [
        { id: 'A', text: 'could have met' },
        { id: 'B', text: 'could meet' },
        { id: 'C', text: 'can have met' },
        { id: 'D', text: 'would meet' },
      ],
      correctAnswer: 'A',
      explanation: 'Use "could have + past participle" to express past hypothetical ability in third conditionals.',
    },
    {
      prompt: 'Select the First Conditional with permission modal:',
      sentence: 'If you finish your assignment on time, you _____ leave early.',
      options: [
        { id: 'A', text: 'may' },
        { id: 'B', text: 'might have' },
        { id: 'C', text: 'would' },
        { id: 'D', text: 'could have' },
      ],
      correctAnswer: 'A',
      explanation: 'First conditionals can use present modals like "can" or "may" in the main clause.',
    },
    {
      prompt: 'Choose the Second Conditional hypothetical condition:',
      sentence: 'If he _____ more spare time, he would learn Mandarin.',
      options: [
        { id: 'A', text: 'had' },
        { id: 'B', text: 'has' },
        { id: 'C', text: 'would have' },
        { id: 'D', text: 'had had' },
      ],
      correctAnswer: 'A',
      explanation: 'The condition clause of the Second Conditional uses the Past Simple ("had").',
    },
    {
      prompt: 'Complete Third Conditional past regret:',
      sentence: 'If I _____ that the bridge was closed, I would not have taken this route.',
      options: [
        { id: 'A', text: 'had known' },
        { id: 'B', text: 'knew' },
        { id: 'C', text: 'have known' },
        { id: 'D', text: 'would know' },
      ],
      correctAnswer: 'A',
      explanation: 'Third conditional if-clauses take the Past Perfect ("had known").',
    },
    {
      prompt: 'Complete the mixed conditional (past condition, present result):',
      sentence: 'If he had accepted that international offer last year, he _____ in Zurich today.',
      options: [
        { id: 'A', text: 'would be living' },
        { id: 'B', text: 'would have lived' },
        { id: 'C', text: 'will live' },
        { id: 'D', text: 'is living' },
      ],
      correctAnswer: 'A',
      explanation: 'Mixed conditional combines a Past Perfect condition with a "would + be + verb-ing" present result.',
    },
    {
      prompt: 'Select Zero Conditional emergency procedure:',
      sentence: 'If you press the emergency alarm, the security gates _____ immediately.',
      options: [
        { id: 'A', text: 'lock' },
        { id: 'B', text: 'will lock' },
        { id: 'C', text: 'locked' },
        { id: 'D', text: 'would lock' },
      ],
      correctAnswer: 'A',
      explanation: 'Automated mechanical instructions use Simple Present in both clauses.',
    },
    {
      prompt: 'Choose the formal inverted Second Conditional:',
      sentence: '_____ the committee to approve the proposal, construction could begin next week.',
      options: [
        { id: 'A', text: 'Were' },
        { id: 'B', text: 'Was' },
        { id: 'C', text: 'Had' },
        { id: 'D', text: 'Should' },
      ],
      correctAnswer: 'A',
      explanation: 'In formal conditional inversion without "if", use "Were + subject + to-infinitive".',
    },
  ],
  'Passive Voice & Reported Speech': [
    {
      prompt: 'Choose the correct Past Simple Passive form:',
      sentence: 'The famous novel _____ by George Orwell in 1949.',
      options: [
        { id: 'A', text: 'wrote' },
        { id: 'B', text: 'was written' },
        { id: 'C', text: 'is writing' },
        { id: 'D', text: 'has written' },
      ],
      correctAnswer: 'B',
      explanation: "Use Past Simple Passive ('was + past participle': 'was written') when the focus is on the object and the past action.",
    },
    {
      prompt: 'Select the Present Continuous Passive form:',
      sentence: 'The new bridge _____ by engineers right now.',
      options: [
        { id: 'A', text: 'is being constructed' },
        { id: 'B', text: 'is constructed' },
        { id: 'C', text: 'was constructing' },
        { id: 'D', text: 'has constructed' },
      ],
      correctAnswer: 'A',
      explanation: "Present Continuous Passive is formed with 'is/are being + past participle' ('is being constructed').",
    },
    {
      prompt: 'Convert to Reported Speech (future backshift):',
      sentence: 'He told me that he _____ to Paris the following week.',
      options: [
        { id: 'A', text: 'will travel' },
        { id: 'B', text: 'would travel' },
        { id: 'C', text: 'is traveling' },
        { id: 'D', text: 'travels' },
      ],
      correctAnswer: 'B',
      explanation: "In Reported Speech, future 'will travel' shifts back to 'would travel' after a past reporting verb ('told').",
    },
    {
      prompt: 'Convert direct speech to reported speech:',
      sentence: "Mary said, 'I am very tired.' → Mary said that she _____ very tired.",
      options: [
        { id: 'A', text: 'is' },
        { id: 'B', text: 'was' },
        { id: 'C', text: 'has been' },
        { id: 'D', text: 'had' },
      ],
      correctAnswer: 'B',
      explanation: "In Reported Speech, the present tense 'am' shifts back to the past tense 'was'.",
    },
    {
      prompt: 'Complete with the correct Present Simple Passive:',
      sentence: 'Millions of emails _____ globally every single minute.',
      options: [
        { id: 'A', text: 'are sent' },
        { id: 'B', text: 'send' },
        { id: 'C', text: 'is sent' },
        { id: 'D', text: 'were sending' },
      ],
      correctAnswer: 'A',
      explanation: "Present Simple Passive for plural subjects ('emails') uses 'are + past participle' ('are sent').",
    },
    {
      prompt: 'Select the Present Perfect Passive verb:',
      sentence: 'The software application _____ by over ten thousand users this week.',
      options: [
        { id: 'A', text: 'has been downloaded' },
        { id: 'B', text: 'is downloaded' },
        { id: 'C', text: 'was downloaded' },
        { id: 'D', text: 'has downloaded' },
      ],
      correctAnswer: 'A',
      explanation: 'Form Present Perfect Passive with "has/have been + past participle".',
    },
    {
      prompt: 'Convert Past Simple to Reported Speech (backshift to Past Perfect):',
      sentence: 'He said, "I lost my security badge." → He said that he _____ his security badge.',
      options: [
        { id: 'A', text: 'had lost' },
        { id: 'B', text: 'lost' },
        { id: 'C', text: 'has lost' },
        { id: 'D', text: 'was losing' },
      ],
      correctAnswer: 'A',
      explanation: 'In Reported Speech, Past Simple ("lost") backshifts to Past Perfect ("had lost").',
    },
    {
      prompt: 'Choose the Modal Passive form:',
      sentence: 'All project reports _____ to the evaluation committee before Friday.',
      options: [
        { id: 'A', text: 'must be submitted' },
        { id: 'B', text: 'must submit' },
        { id: 'C', text: 'must been submitted' },
        { id: 'D', text: 'must submitting' },
      ],
      correctAnswer: 'A',
      explanation: 'Form Modal Passive with "modal + be + past participle" (must be submitted).',
    },
    {
      prompt: 'Select Future Simple Passive:',
      sentence: 'The new medical research facility _____ by the premier next month.',
      options: [
        { id: 'A', text: 'will be opened' },
        { id: 'B', text: 'is opened' },
        { id: 'C', text: 'will open' },
        { id: 'D', text: 'opened' },
      ],
      correctAnswer: 'A',
      explanation: 'Form Future Simple Passive with "will be + past participle" (will be opened).',
    },
    {
      prompt: 'Reported Speech for Wh-question word order:',
      sentence: 'She asked me, "Where do you live?" → She asked me where I _____ .',
      options: [
        { id: 'A', text: 'lived' },
        { id: 'B', text: 'did live' },
        { id: 'C', text: 'live' },
        { id: 'D', text: 'was living' },
      ],
      correctAnswer: 'A',
      explanation: 'Reported questions take statement word order (where + subject + verb) with tense backshift.',
    },
    {
      prompt: 'Select Past Continuous Passive:',
      sentence: 'The historic building _____ when the unexpected fire broke out.',
      options: [
        { id: 'A', text: 'was being renovated' },
        { id: 'B', text: 'was renovated' },
        { id: 'C', text: 'is being renovated' },
        { id: 'D', text: 'had renovated' },
      ],
      correctAnswer: 'A',
      explanation: 'Past Continuous Passive is formed with "was/were being + past participle".',
    },
    {
      prompt: 'Reported Speech for imperative command:',
      sentence: 'The librarian told us, "Please be quiet." → The librarian told us _____ quiet.',
      options: [
        { id: 'A', text: 'to be' },
        { id: 'B', text: 'being' },
        { id: 'C', text: 'be' },
        { id: 'D', text: 'that we are' },
      ],
      correctAnswer: 'A',
      explanation: 'Reported commands and requests use "to + infinitive" (told us to be quiet).',
    },
    {
      prompt: 'Passive with agent by-phrase:',
      sentence: 'The classical concerto _____ by a master pianist in 1812.',
      options: [
        { id: 'A', text: 'was composed' },
        { id: 'B', text: 'composed' },
        { id: 'C', text: 'is composed' },
        { id: 'D', text: 'has been composed' },
      ],
      correctAnswer: 'A',
      explanation: 'Use Past Simple Passive ("was composed") with agent "by a master pianist" for historical achievements.',
    },
    {
      prompt: 'Reported Speech modal backshift (can -> could):',
      sentence: 'Sarah said, "I can attend the seminar." → Sarah said that she _____ attend the seminar.',
      options: [
        { id: 'A', text: 'could' },
        { id: 'B', text: 'can' },
        { id: 'C', text: 'would can' },
        { id: 'D', text: 'might' },
      ],
      correctAnswer: 'A',
      explanation: 'In Reported Speech, "can" backshifts to "could".',
    },
    {
      prompt: 'Passive question form:',
      sentence: '_____ the annual balance sheets audited by the external agency?',
      options: [
        { id: 'A', text: 'Were' },
        { id: 'B', text: 'Did' },
        { id: 'C', text: 'Have' },
        { id: 'D', text: 'Was' },
      ],
      correctAnswer: 'A',
      explanation: 'Plural passive questions in past use "Were + plural subject + past participle?".',
    },
  ],
};

// Aliases for topic naming variations
TOPIC_FALLBACKS['Conditionals (0,1,2,3)'] = TOPIC_FALLBACKS['Conditionals (0, 1, 2, 3)'];
TOPIC_FALLBACKS['Passive Voice'] = TOPIC_FALLBACKS['Passive Voice & Reported Speech'];
TOPIC_FALLBACKS['Past Simple'] = TOPIC_FALLBACKS['Past Simple & Continuous'];
TOPIC_FALLBACKS['Future Forms'] = TOPIC_FALLBACKS['Future Forms & Modals'];

const sampleQuestions = (pool = [], count = 5, seed = Date.now().toString()) => {
  if (!pool || pool.length <= count) return pool.slice(0, count);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const rng = (limit) => {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.floor((Math.abs(hash) / 233280) * limit);
  };
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

export const generateGrammarQuestions = async (topic = 'Present Simple', level = 'B1', count = 5, sessionId = null, timestamp = null) => {
  const nonce = `${sessionId || ''}_${timestamp || Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const prompt = `You are a professional English language educator.
Generate ${count} completely unique, non-repetitive interactive grammar practice questions for a student at English CEFR level "${level}" on the topic "${topic}".
Unique generation seed: ${nonce}.
EVERY SINGLE QUESTION must directly test the grammar concept "${topic}".
Return ONLY valid JSON matching this schema:
{
  "topic": "${topic}",
  "level": "${level}",
  "title": "${topic} Practice",
  "description": "Learn and master ${topic} with targeted exercises.",
  "examples": [
    { "text": "Example sentence for ${topic}." }
  ],
  "questions": [
    {
      "id": 1,
      "prompt": "Choose the correct sentence:",
      "sentence": "Sentence context testing ${topic}...",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctAnswer": "B",
      "explanation": "Grammatical rule explanation for ${topic}."
    }
  ]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      parsed.questions = normalizeQuestions(parsed.questions);
      return parsed;
    }
  } catch (error) {
    console.warn('[GeminiService] generateGrammarQuestions fallback active:', error.message);
  }

  // Graceful, educational fallback matching topic with dynamic sampling
  const getTopicQuestions = (t) => {
    if (TOPIC_FALLBACKS[t]) return TOPIC_FALLBACKS[t];
    const normalized = (t || '').trim().toLowerCase();
    for (const [key, qList] of Object.entries(TOPIC_FALLBACKS)) {
      if (key.toLowerCase() === normalized || key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase())) {
        return qList;
      }
    }
    return TOPIC_FALLBACKS['Present Simple'];
  };

  const pool = getTopicQuestions(topic);
  const sampled = sampleQuestions(pool, count, nonce);

  // Assign unique session-aware question IDs
  const assigned = sampled.map((q, idx) => ({
    ...q,
    id: `${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${nonce}_${idx + 1}`,
    number: idx + 1,
  }));

  return {
    topic,
    level,
    title: `${topic} Practice`,
    description: `Master core grammar rules for ${topic}.`,
    examples: [{ text: `Pay attention to verb forms, auxiliary verbs, and time markers in ${topic}.` }],
    questions: normalizeQuestions(assigned),
  };
};

// ==========================================
// 2. VOCABULARY GENERATOR (50+ CURATED CEFR WORDS)
// ==========================================
const VOCABULARY_BANK = [
  {
    word: 'Diligent',
    phonetic: '/ˈdɪl.ə.dʒənt/',
    partOfSpeech: 'Adjective',
    level: 'B1',
    meaning: 'Showing steady, earnest, and energetic effort in completing tasks.',
    example: 'She was a diligent student who consistently reviewed her notes every evening.',
    synonyms: ['hardworking', 'assiduous', 'attentive'],
    antonyms: ['lazy', 'careless', 'negligent'],
    practiceQuestion: {
      prompt: 'Which word is closest in meaning to "Diligent"?',
      options: [
        { id: 'A', text: 'Hesitant' },
        { id: 'B', text: 'Hardworking' },
        { id: 'C', text: 'Carefree' },
        { id: 'D', text: 'Impatient' },
      ],
      correctAnswer: 'B',
      explanation: '"Diligent" means showing persistent effort and hard work in one\'s duties.',
    },
  },
  {
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'Adjective',
    level: 'B1',
    meaning: 'Able to withstand or recover quickly from difficult conditions.',
    example: 'The local community proved remarkably resilient during the economic recovery.',
    synonyms: ['adaptable', 'tough', 'durable'],
    antonyms: ['fragile', 'vulnerable', 'weak'],
    practiceQuestion: {
      prompt: 'Choose the word that means "able to recover quickly from adversity":',
      options: [
        { id: 'A', text: 'Resilient' },
        { id: 'B', text: 'Reluctant' },
        { id: 'C', text: 'Rigid' },
        { id: 'D', text: 'Redundant' },
      ],
      correctAnswer: 'A',
      explanation: '"Resilient" refers to the ability to bounce back and thrive after hardship.',
    },
  },
  {
    word: 'Meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Showing great attention to detail; very careful and precise.',
    example: 'He conducted a meticulous review of the contract before finalizing the deal.',
    synonyms: ['thorough', 'scrupulous', 'exact'],
    antonyms: ['careless', 'sloppy', 'inaccurate'],
    practiceQuestion: {
      prompt: 'What is the antonym (opposite) of "Meticulous"?',
      options: [
        { id: 'A', text: 'Careless' },
        { id: 'B', text: 'Thorough' },
        { id: 'C', text: 'Accurate' },
        { id: 'D', text: 'Precise' },
      ],
      correctAnswer: 'A',
      explanation: 'While "meticulous" means extremely thorough and precise, its antonym is "careless".',
    },
  },
  {
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Dealing with things sensibly and realistically based on practical considerations.',
    example: 'They adopted a pragmatic approach to solve the budget deficit.',
    synonyms: ['practical', 'realistic', 'sensible'],
    antonyms: ['idealistic', 'impractical', 'unrealistic'],
    practiceQuestion: {
      prompt: 'Select the best definition for "Pragmatic":',
      options: [
        { id: 'A', text: 'Guided by practical rather than theoretical considerations' },
        { id: 'B', text: 'Overly dramatic and emotional' },
        { id: 'C', text: 'Hesitant to take action' },
        { id: 'D', text: 'Strictly traditional and rigid' },
      ],
      correctAnswer: 'A',
      explanation: '"Pragmatic" describes an attitude focused on realistic, workable results.',
    },
  },
  {
    word: 'Eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Fluent, persuasive, and expressive in speaking or writing.',
    example: 'The speaker delivered an eloquent speech that moved the entire audience.',
    synonyms: ['articulate', 'persuasive', 'fluent'],
    antonyms: ['inarticulate', 'clumsy', 'unclear'],
    practiceQuestion: {
      prompt: 'Which word describes someone who speaks clearly, persuasively, and with grace?',
      options: [
        { id: 'A', text: 'Eloquent' },
        { id: 'B', text: 'Evasive' },
        { id: 'C', text: 'Eccentric' },
        { id: 'D', text: 'Equivocal' },
      ],
      correctAnswer: 'A',
      explanation: '"Eloquent" means expressing ideas clearly, forcefully, and beautifully.',
    },
  },
  {
    word: 'Tenacious',
    phonetic: '/təˈneɪ.ʃəs/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Holding fast; characterized by persistent determination.',
    example: 'Her tenacious spirit allowed her to complete the marathon despite severe cramps.',
    synonyms: ['persistent', 'determined', 'resolute'],
    antonyms: ['yielding', 'irresolute', 'surrendering'],
    practiceQuestion: {
      prompt: 'Which word is a synonym for "Tenacious"?',
      options: [
        { id: 'A', text: 'Persistent' },
        { id: 'B', text: 'Timid' },
        { id: 'C', text: 'Trivial' },
        { id: 'D', text: 'Temporary' },
      ],
      correctAnswer: 'A',
      explanation: '"Tenacious" means not giving up easily; holding firm to a goal or belief.',
    },
  },
  {
    word: 'Cognizant',
    phonetic: '/ˈkɑːɡ.nə.zənt/',
    partOfSpeech: 'Adjective',
    level: 'C1',
    meaning: 'Having knowledge or being fully aware of something.',
    example: 'Statesmen must remain cognizant of geopolitical shifts across the region.',
    synonyms: ['aware', 'mindful', 'conscious'],
    antonyms: ['unaware', 'oblivious', 'ignorant'],
    practiceQuestion: {
      prompt: 'What does it mean to be "Cognizant" of an issue?',
      options: [
        { id: 'A', text: 'To be fully aware and conscious of it' },
        { id: 'B', text: 'To deliberately ignore it' },
        { id: 'C', text: 'To be afraid of it' },
        { id: 'D', text: 'To disagree with it' },
      ],
      correctAnswer: 'A',
      explanation: '"Cognizant" comes from Latin meaning to know, signifying full awareness.',
    },
  },
  {
    word: 'Empathetic',
    phonetic: '/ˌem.pəˈθet̬.ɪk/',
    partOfSpeech: 'Adjective',
    level: 'B1',
    meaning: 'Showing the ability to understand and share the feelings of another.',
    example: 'An empathetic leader listens actively to the concerns of their team members.',
    synonyms: ['compassionate', 'understanding', 'sensitive'],
    antonyms: ['callous', 'indifferent', 'unfeeling'],
    practiceQuestion: {
      prompt: 'Which word best describes a person who genuinely understands others’ feelings?',
      options: [
        { id: 'A', text: 'Empathetic' },
        { id: 'B', text: 'Enigmatic' },
        { id: 'C', text: 'Erratic' },
        { id: 'D', text: 'Exotic' },
      ],
      correctAnswer: 'A',
      explanation: '"Empathetic" individuals possess empathy—the capacity to share others\' emotions.',
    },
  },
  {
    word: 'Fastidious',
    phonetic: '/fæsˈtɪd.i.əs/',
    partOfSpeech: 'Adjective',
    level: 'C1',
    meaning: 'Very attentive to and concerned about accuracy and detail.',
    example: 'The chef was fastidious about the temperature of every dish served.',
    synonyms: ['demanding', 'exacting', 'fussy'],
    antonyms: ['uncritical', 'lax', 'easygoing'],
    practiceQuestion: {
      prompt: 'What is the meaning of "Fastidious"?',
      options: [
        { id: 'A', text: 'Very attentive to cleanliness, accuracy, and detail' },
        { id: 'B', text: 'Moving at an extraordinarily high speed' },
        { id: 'C', text: 'Showing lack of interest or passion' },
        { id: 'D', text: 'Highly generous with money' },
      ],
      correctAnswer: 'A',
      explanation: '"Fastidious" means having excessively high standards and demanding precision.',
    },
  },
  {
    word: 'Lucid',
    phonetic: '/ˈluː.sɪd/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Expressed clearly; easy to understand, or having full mental clarity.',
    example: 'The professor gave a lucid explanation of quantum physics that everyone grasped.',
    synonyms: ['clear', 'coherent', 'comprehensible'],
    antonyms: ['confusing', 'vague', 'obscure'],
    practiceQuestion: {
      prompt: 'Which word means "clearly expressed and easy to understand"?',
      options: [
        { id: 'A', text: 'Lucid' },
        { id: 'B', text: 'Lurking' },
        { id: 'C', text: 'Lukewarm' },
        { id: 'D', text: 'Lucrative' },
      ],
      correctAnswer: 'A',
      explanation: '"Lucid" comes from the Latin for light, meaning crystal clear and understandable.',
    },
  },
  {
    word: 'Audacious',
    phonetic: '/ɑːˈdeɪ.ʃəs/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Showing a willingness to take surprisingly bold risks.',
    example: 'The entrepreneur launched an audacious campaign to challenge industry giants.',
    synonyms: ['bold', 'daring', 'fearless'],
    antonyms: ['timid', 'cautious', 'meek'],
    practiceQuestion: {
      prompt: 'Choose the antonym for "Audacious":',
      options: [
        { id: 'A', text: 'Timid' },
        { id: 'B', text: 'Courageous' },
        { id: 'C', text: 'Bold' },
        { id: 'D', text: 'Adventurous' },
      ],
      correctAnswer: 'A',
      explanation: 'While "audacious" means daring and brave, "timid" means shy and fearful.',
    },
  },
  {
    word: 'Authentic',
    phonetic: '/ɑːˈθen.tɪk/',
    partOfSpeech: 'Adjective',
    level: 'A2/B1',
    meaning: 'Of undisputed origin; genuine and real.',
    example: 'The restaurant is renowned for serving authentic Mediterranean cuisine.',
    synonyms: ['genuine', 'real', 'original'],
    antonyms: ['fake', 'counterfeit', 'artificial'],
    practiceQuestion: {
      prompt: 'Which word means "genuine and not copied"?',
      options: [
        { id: 'A', text: 'Authentic' },
        { id: 'B', text: 'Ambitious' },
        { id: 'C', text: 'Apparent' },
        { id: 'D', text: 'Artificial' },
      ],
      correctAnswer: 'A',
      explanation: '"Authentic" implies truthfulness to origin, character, or tradition.',
    },
  },
  {
    word: 'Benevolent',
    phonetic: '/bəˈnev.əl.ənt/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Well meaning and kindly; serving charitable purposes.',
    example: 'A benevolent donor provided scholarships for fifty underprivileged students.',
    synonyms: ['kindhearted', 'charitable', 'generous'],
    antonyms: ['malevolent', 'unkind', 'spiteful'],
    practiceQuestion: {
      prompt: 'What does "Benevolent" mean?',
      options: [
        { id: 'A', text: 'Kind and charitable toward others' },
        { id: 'B', text: 'Harsh and demanding in leadership' },
        { id: 'C', text: 'Silent and secretive' },
        { id: 'D', text: 'Greedy and self-centered' },
      ],
      correctAnswer: 'A',
      explanation: '"Benevolent" stems from Latin roots meaning "wishing good".',
    },
  },
  {
    word: 'Candid',
    phonetic: '/ˈkæn.dɪd/',
    partOfSpeech: 'Adjective',
    level: 'B1',
    meaning: 'Truthful, straightforward, and frank in speech.',
    example: 'The author gave a candid interview about his struggles with early rejection.',
    synonyms: ['honest', 'frank', 'direct'],
    antonyms: ['dishonest', 'deceptive', 'evasive'],
    practiceQuestion: {
      prompt: 'Which word is synonymous with "Frank and honest"?',
      options: [
        { id: 'A', text: 'Candid' },
        { id: 'B', text: 'Cautious' },
        { id: 'C', text: 'Cryptic' },
        { id: 'D', text: 'Cynical' },
      ],
      correctAnswer: 'A',
      explanation: '"Candid" speech is open, sincere, and free from deceit.',
    },
  },
  {
    word: 'Exemplary',
    phonetic: '/ɪɡˈzem.plɚ.i/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Serving as a desirable model; representing the best of its kind.',
    example: 'Her exemplary performance earned her the Employee of the Year award.',
    synonyms: ['model', 'ideal', 'flawless'],
    antonyms: ['poor', 'unacceptable', 'substandard'],
    practiceQuestion: {
      prompt: 'Which word means "serving as an ideal example for others"?',
      options: [
        { id: 'A', text: 'Exemplary' },
        { id: 'B', text: 'Excessive' },
        { id: 'C', text: 'Exclusive' },
        { id: 'D', text: 'Exhausting' },
      ],
      correctAnswer: 'A',
      explanation: '"Exemplary" actions serve as an outstanding example worthy of imitation.',
    },
  },
  {
    word: 'Feasible',
    phonetic: '/ˈfiː.zə.bəl/',
    partOfSpeech: 'Adjective',
    level: 'B1',
    meaning: 'Possible to do easily or conveniently; workable.',
    example: 'The engineering team concluded that the solar highway project was highly feasible.',
    synonyms: ['achievable', 'practical', 'viable'],
    antonyms: ['impossible', 'unworkable', 'impractical'],
    practiceQuestion: {
      prompt: 'What is the meaning of "Feasible"?',
      options: [
        { id: 'A', text: 'Capable of being done or carried out successfully' },
        { id: 'B', text: 'Extremely costly and expensive' },
        { id: 'C', text: 'Dangerous to public safety' },
        { id: 'D', text: 'Outdated and obsolete' },
      ],
      correctAnswer: 'A',
      explanation: '"Feasible" plans are practical, achievable, and realistic to execute.',
    },
  },
  {
    word: 'Harmonious',
    phonetic: '/hɑːrˈmoʊ.ni.əs/',
    partOfSpeech: 'Adjective',
    level: 'B1',
    meaning: 'Tuneful; forming a pleasing or consistent whole; free from conflict.',
    example: 'The multicultural team maintained a harmonious and productive work environment.',
    synonyms: ['peaceful', 'concordant', 'congenial'],
    antonyms: ['discordant', 'hostile', 'incompatible'],
    practiceQuestion: {
      prompt: 'Which word is the opposite of "Harmonious"?',
      options: [
        { id: 'A', text: 'Discordant' },
        { id: 'B', text: 'Pleasant' },
        { id: 'C', text: 'Unified' },
        { id: 'D', text: 'Musical' },
      ],
      correctAnswer: 'A',
      explanation: '"Discordant" means harsh, conflicting, and lacking harmony.',
    },
  },
  {
    word: 'Inquisitive',
    phonetic: '/ɪnˈkwɪz.ə.t̬ɪv/',
    partOfSpeech: 'Adjective',
    level: 'B1',
    meaning: 'Curious or inquiring; eager for knowledge.',
    example: 'The inquisitive child constantly asked insightful questions about nature.',
    synonyms: ['curious', 'interested', 'investigative'],
    antonyms: ['uninterested', 'indifferent', 'apathetic'],
    practiceQuestion: {
      prompt: 'What describes someone who is eagerly curious to learn new things?',
      options: [
        { id: 'A', text: 'Inquisitive' },
        { id: 'B', text: 'Insolent' },
        { id: 'C', text: 'Insular' },
        { id: 'D', text: 'Indolent' },
      ],
      correctAnswer: 'A',
      explanation: '"Inquisitive" people possess an active desire to investigate and learn.',
    },
  },
  {
    word: 'Judicious',
    phonetic: '/dʒuːˈdɪʃ.əs/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Having, showing, or done with good judgment or sense.',
    example: 'The board praised her judicious management of the company’s financial reserves.',
    synonyms: ['wise', 'prudent', 'sensible'],
    antonyms: ['foolish', 'reckless', 'indiscreet'],
    practiceQuestion: {
      prompt: 'Choose the synonym for "Judicious":',
      options: [
        { id: 'A', text: 'Prudent' },
        { id: 'B', text: 'Judgmental' },
        { id: 'C', text: 'Juvenile' },
        { id: 'D', text: 'Joyful' },
      ],
      correctAnswer: 'A',
      explanation: '"Judicious" decisions reflect wisdom, prudence, and sound thinking.',
    },
  },
  {
    word: 'Keen',
    phonetic: '/kiːn/',
    partOfSpeech: 'Adjective',
    level: 'A2/B1',
    meaning: 'Having or showing eagerness or enthusiasm; sharp or penetrating in intellect.',
    example: 'She has a keen eye for subtle design details that others overlook.',
    synonyms: ['sharp', 'eager', 'acute'],
    antonyms: ['dull', 'blunt', 'apathetic'],
    practiceQuestion: {
      prompt: 'What is the meaning of "Keen" in "a keen observer"?',
      options: [
        { id: 'A', text: 'Sharp, perceptive, and quick-witted' },
        { id: 'B', text: 'Lazy and distracted' },
        { id: 'C', text: 'Physically weak' },
        { id: 'D', text: 'Unreliable' },
      ],
      correctAnswer: 'A',
      explanation: '"Keen" intellect or senses are exceptionally sharp and perceptive.',
    },
  },
  {
    word: 'Nuanced',
    phonetic: '/ˈnuː.ɑːnst/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Characterized by subtle distinctions and variations in meaning.',
    example: 'The documentary presented a nuanced perspective on global migration.',
    synonyms: ['subtle', 'refined', 'detailed'],
    antonyms: ['crude', 'oversimplified', 'black-and-white'],
    practiceQuestion: {
      prompt: 'Which word means "having subtle shades of meaning or distinction"?',
      options: [
        { id: 'A', text: 'Nuanced' },
        { id: 'B', text: 'Noxious' },
        { id: 'C', text: 'Notorious' },
        { id: 'D', text: 'Neutral' },
      ],
      correctAnswer: 'A',
      explanation: '"Nuanced" discussions acknowledge subtle complexities rather than gross simplifications.',
    },
  },
  {
    word: 'Plausible',
    phonetic: '/ˈplɑː.zə.bəl/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Seeming reasonable or probable; believable.',
    example: 'The scientist offered a plausible hypothesis explaining the strange data.',
    synonyms: ['believable', 'credible', 'reasonable'],
    antonyms: ['implausible', 'unlikely', 'unbelievable'],
    practiceQuestion: {
      prompt: 'What does "Plausible" mean?',
      options: [
        { id: 'A', text: 'Reasonable and likely to be true' },
        { id: 'B', text: 'Extremely loud and disruptive' },
        { id: 'C', text: 'Full of decorative ornaments' },
        { id: 'D', text: 'Proven false beyond doubt' },
      ],
      correctAnswer: 'A',
      explanation: '"Plausible" arguments are credible and believable based on available facts.',
    },
  },
  {
    word: 'Robust',
    phonetic: '/roʊˈbʌst/',
    partOfSpeech: 'Adjective',
    level: 'B2',
    meaning: 'Strong and healthy; vigorous; able to withstand stress.',
    example: 'The cybersecurity team built a robust network defense against malware attacks.',
    synonyms: ['sturdy', 'strong', 'tough'],
    antonyms: ['frail', 'weak', 'flimsy'],
    practiceQuestion: {
      prompt: 'Choose the synonym for "Robust":',
      options: [
        { id: 'A', text: 'Sturdy' },
        { id: 'B', text: 'Rotten' },
        { id: 'C', text: 'Rough' },
        { id: 'D', text: 'Routine' },
      ],
      correctAnswer: 'A',
      explanation: '"Robust" systems, structures, or bodies are hardy, resilient, and durable.',
    },
  },
  {
    word: 'Sagacious',
    phonetic: '/səˈɡeɪ.ʃəs/',
    partOfSpeech: 'Adjective',
    level: 'C1',
    meaning: 'Having or showing keen mental discernment and good judgment; wise.',
    example: 'The CEO was known for her sagacious investments during market fluctuations.',
    synonyms: ['wise', 'insightful', 'discerning'],
    antonyms: ['foolish', 'ignorant', 'shortsighted'],
    practiceQuestion: {
      prompt: 'Which word means "wise and showing profound insight"?',
      options: [
        { id: 'A', text: 'Sagacious' },
        { id: 'B', text: 'Spontaneous' },
        { id: 'C', text: 'Superficial' },
        { id: 'D', text: 'Sinister' },
      ],
      correctAnswer: 'A',
      explanation: '"Sagacious" indicates deep wisdom, acute judgment, and foresight.',
    },
  },
  {
    word: 'Tactful',
    phonetic: '/ˈtækt.fəl/',
    partOfSpeech: 'Adjective',
    level: 'B1',
    meaning: 'Having or showing sensitivity in dealing with others or difficult issues.',
    example: 'She gave a tactful response to the critique without causing any offense.',
    synonyms: ['diplomatic', 'discreet', 'polite'],
    antonyms: ['tactless', 'blunt', 'rude'],
    practiceQuestion: {
      prompt: 'What is the meaning of "Tactful"?',
      options: [
        { id: 'A', text: 'Careful not to offend or upset others' },
        { id: 'B', text: 'Highly technical and complex' },
        { id: 'C', text: 'Quick to anger and argue' },
        { id: 'D', text: 'Speaking loudly without thinking' },
      ],
      correctAnswer: 'A',
      explanation: '"Tactful" individuals express themselves politely to preserve harmony.',
    },
  },
];

export const generateVocabularyContent = async (
  level = 'B1',
  count = 5,
  excludedWords = [],
  sessionId = null,
  timestamp = Date.now()
) => {
  const targetCount = Number(count) || 5;

  const prompt = `You are a professional English vocabulary teacher.
Generate exactly ${targetCount} high-utility vocabulary words suited for English CEFR level "${level}".
Exclude these words if possible: ${JSON.stringify(excludedWords)}.
Return ONLY valid JSON matching this schema:
{
  "level": "${level}",
  "words": [
    {
      "id": 1,
      "word": "Tenacious",
      "phonetic": "/təˈneɪ.ʃəs/",
      "partOfSpeech": "Adjective",
      "meaning": "Holding fast; characterized by persistent determination.",
      "example": "Her tenacious spirit allowed her to complete the marathon despite severe cramps.",
      "synonyms": ["persistent", "determined", "resolute"],
      "antonyms": ["yielding", "irresolute", "surrendering"],
      "practiceQuestion": {
        "prompt": "Which word is closest in meaning to 'Tenacious'?",
        "options": [
          { "id": "A", "text": "Persistent" },
          { "id": "B", "text": "Timid" },
          { "id": "C", "text": "Trivial" },
          { "id": "D", "text": "Temporary" }
        ],
        "correctAnswer": "A",
        "explanation": "'Tenacious' means not giving up easily; holding firm to a goal."
      }
    }
  ]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);
    if (parsed && Array.isArray(parsed.words) && parsed.words.length >= targetCount) {
      return {
        level,
        words: parsed.words.slice(0, targetCount).map((w, idx) => ({
          ...w,
          id: idx + 1,
          practiceQuestion: w.practiceQuestion ? shuffleQuestionOptions(w.practiceQuestion) : null,
          bookmarked: false,
        })),
      };
    }
  } catch (error) {
    console.warn('[GeminiService] generateVocabularyContent fallback active:', error.message);
  }

  // --- Resilient Nonce-Seeded Fisher-Yates Selection ---
  const seedString = `${sessionId || 'sess'}_${timestamp || Date.now()}_${level}_${Math.random()}`;
  let seedNum = 0;
  for (let i = 0; i < seedString.length; i++) {
    seedNum = (seedNum << 5) - seedNum + seedString.charCodeAt(i);
    seedNum |= 0;
  }
  const pseudoRandom = () => {
    seedNum = (seedNum * 9301 + 49297) % 233280;
    return Math.abs(seedNum) / 233280;
  };

  // Filter out excluded words if enough alternatives exist
  const excludedSet = new Set((excludedWords || []).map((w) => String(w).toLowerCase().trim()));
  let candidatePool = VOCABULARY_BANK.filter((item) => !excludedSet.has(item.word.toLowerCase()));
  if (candidatePool.length < targetCount) {
    candidatePool = [...VOCABULARY_BANK];
  }

  // Fisher-Yates shuffle
  const pool = [...candidatePool];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selectedWords = pool.slice(0, targetCount).map((item, idx) => ({
    id: idx + 1,
    word: item.word,
    phonetic: item.phonetic,
    partOfSpeech: item.partOfSpeech || 'Adjective',
    meaning: item.meaning,
    example: item.example,
    synonyms: item.synonyms,
    antonyms: item.antonyms,
    practiceQuestion: item.practiceQuestion ? shuffleQuestionOptions(item.practiceQuestion) : null,
    bookmarked: false,
  }));

  return {
    level,
    words: selectedWords,
  };
};

// ==========================================
// 3. READING PASSAGE GENERATOR (8 FULL 10-QUESTION PASSAGES)
// ==========================================
const READING_PASSAGES_BANK = [
  {
    topic: 'The Architecture of Focus',
    level: 'B1',
    title: 'The Architecture of Focus',
    wordCount: 295,
    difficultWords: ['Ubiquitous', 'Fragmented', 'Deliberate', 'Diminishes', 'Cognitive'],
    passage: `In modern society, cultivating deep focus has become one of the most valuable cognitive assets. With ubiquitous digital notifications and constant multitasking, the human attention span is continually fragmented.\n\nResearch in educational psychology reveals that deliberate, uninterrupted study sessions significantly enhance memory retention and analytical reasoning. When learners establish consistent daily routines and eliminate ambient distractions, cognitive load diminishes, allowing deeper conceptual connections to take root.\n\nNeurologists emphasize that the human brain operates with finite mental bandwidth. Every interruption forces a costly mental reset, draining vital glucose and energy reserves. Conversely, sustained immersion in a single task triggers a state often described as deep work or flow, wherein complex information is synthesized rapidly.\n\nUltimately, mastery of any discipline—including foreign language acquisition—is not determined solely by innate talent, but by sustained consistency and deliberate practice over extended periods.`,
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the primary theme of the passage?',
        options: [
          { id: 'A', text: 'The evolutionary history of the human attention span' },
          { id: 'B', text: 'The importance of sustained, uninterrupted focus for learning and mastery' },
          { id: 'C', text: 'The financial advantages of digital notifications in modern workplaces' },
          { id: 'D', text: 'How innate talent completely replaces the need for deliberate practice' },
        ],
        correctAnswer: 'B',
        explanation: 'The entire passage argues that cultivating deep, uninterrupted focus is essential for retention, problem-solving, and mastery.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'According to the passage, what causes the human attention span to become fragmented?',
        options: [
          { id: 'A', text: 'Ubiquitous digital notifications and constant multitasking' },
          { id: 'B', text: 'Lack of proper physical exercise' },
          { id: 'C', text: 'Reading long literary books' },
          { id: 'D', text: 'Studying foreign languages early in the morning' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 1 explicitly identifies ubiquitous digital alerts and multitasking as causes of fragmented attention.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'What does the word "ubiquitous" in paragraph 1 most nearly mean?',
        options: [
          { id: 'A', text: 'Extremely rare and difficult to locate' },
          { id: 'B', text: 'Present, appearing, or found everywhere' },
          { id: 'C', text: 'Completely useless and obsolete' },
          { id: 'D', text: 'Dangerous to human physical health' },
        ],
        correctAnswer: 'B',
        explanation: '"Ubiquitous" means present or found everywhere, describing modern digital notifications.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'How do deliberate, uninterrupted study sessions benefit learners?',
        options: [
          { id: 'A', text: 'They significantly enhance memory retention and analytical reasoning' },
          { id: 'B', text: 'They eliminate the need to ever review notes again' },
          { id: 'C', text: 'They guarantee instantaneous language fluency within hours' },
          { id: 'D', text: 'They increase mental fatigue beyond recovery' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 highlights that uninterrupted sessions boost both retention and analytical reasoning.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'What happens to cognitive load when learners establish routines and remove distractions?',
        options: [
          { id: 'A', text: 'It increases drastically' },
          { id: 'B', text: 'It diminishes, facilitating deeper conceptual connections' },
          { id: 'C', text: 'It prevents the brain from synthesizing information' },
          { id: 'D', text: 'It remains entirely unchanged' },
        ],
        correctAnswer: 'B',
        explanation: 'Paragraph 2 states that removing ambient distractions diminishes cognitive load.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'What biological cost does the brain experience when interrupted during deep work?',
        options: [
          { id: 'A', text: 'A costly mental reset that drains glucose and energy reserves' },
          { id: 'B', text: 'Immediate and irreversible memory destruction' },
          { id: 'C', text: 'A temporary surge in physical stamina' },
          { id: 'D', text: 'A complete loss of hearing ability' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 explains that each interruption forces a reset that drains mental bandwidth and glucose.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'What state occurs when a learner experiences sustained immersion in a single task?',
        options: [
          { id: 'A', text: 'Chronic procrastination' },
          { id: 'B', text: 'A state of flow where complex information is synthesized rapidly' },
          { id: 'C', text: 'Severe sensory disorientation' },
          { id: 'D', text: 'Immediate sleep onset' },
        ],
        correctAnswer: 'B',
        explanation: 'Paragraph 3 describes deep work or flow as enabling rapid synthesis of complex material.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'According to the final paragraph, what truly determines mastery of a discipline?',
        options: [
          { id: 'A', text: 'Relying strictly on innate talent alone' },
          { id: 'B', text: 'Sustained consistency and deliberate practice over time' },
          { id: 'C', text: 'Purchasing high-end digital hardware' },
          { id: 'D', text: 'Avoiding challenging cognitive tasks' },
        ],
        correctAnswer: 'B',
        explanation: 'The conclusion states that mastery comes from sustained consistency and deliberate practice.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'What can be inferred about multitasking from the passage?',
        options: [
          { id: 'A', text: 'It increases analytical reasoning speed' },
          { id: 'B', text: 'It is inefficient and counterproductive to deep learning' },
          { id: 'C', text: 'It is the recommended strategy for foreign language learners' },
          { id: 'D', text: 'It reduces physical fatigue in office workers' },
        ],
        correctAnswer: 'B',
        explanation: 'The author portrays multitasking as fragmenting attention and draining energy reserves.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What is the overall tone of the author throughout the passage?',
        options: [
          { id: 'A', text: 'Informative, analytical, and encouraging' },
          { id: 'B', text: 'Sarcastic and deeply dismissive' },
          { id: 'C', text: 'Indifferent and disinterested' },
          { id: 'D', text: 'Aggressive and confrontational' },
        ],
        correctAnswer: 'A',
        explanation: 'The author writes with an educational, informative, and encouraging perspective on focus and learning.',
      },
    ],
  },
  {
    topic: 'Urban Reforestation and Microclimates',
    level: 'B1',
    title: 'Urban Reforestation and Microclimates',
    wordCount: 310,
    difficultWords: ['Impermeable', 'Microclimate', 'Mitigate', 'Biodiversity', 'Canopy'],
    passage: `As global metropolitan areas expand, concrete structures and asphalt roads create what climatologists term the urban heat island effect. Dark, impermeable surfaces absorb solar radiation during daylight hours and re-radiate thermal energy overnight, elevating city temperatures significantly above adjacent rural baselines.\n\nTo mitigate this localized warming, modern urban planners are adopting urban reforestation initiatives. Inspired by Japanese botanist Akira Miyawaki, cities plant dense, biodiverse micro-forests in pocket parks, vacant lots, and highway medians.\n\nThese compact woodland ecosystems grow up to ten times faster and achieve thirty times greater density than conventional parkland. The dense leafy canopy provides direct shade, while evapotranspiration releases moisture into the atmosphere, lowering neighborhood ambient temperatures by up to four degrees Celsius.\n\nBeyond temperature moderation, urban micro-forests improve air quality by absorbing fine particulate matter, sequestering atmospheric carbon, and restoring habitats for native birds and pollinators. Transforming gray urban landscapes into vibrant green canopies has emerged as a cost-effective strategy for climate resilience.`,
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the central focus of the text?',
        options: [
          { id: 'A', text: 'How urban micro-forests counteract urban heat islands and enhance city ecosystems' },
          { id: 'B', text: 'The history of automobile manufacturing in modern metropolitan areas' },
          { id: 'C', text: 'Why concrete and asphalt are the only viable materials for road construction' },
          { id: 'D', text: 'How rural agricultural yields surpass city gardening outputs' },
        ],
        correctAnswer: 'A',
        explanation: 'The passage explores the causes of the urban heat island effect and how urban micro-forests mitigate it.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'What causes the urban heat island effect according to the first paragraph?',
        options: [
          { id: 'A', text: 'Dark, impermeable concrete and asphalt absorbing and re-radiating heat' },
          { id: 'B', text: 'Excessive planting of tall trees in residential zones' },
          { id: 'C', text: 'Heavy rainfall during the winter months' },
          { id: 'D', text: 'Cold oceanic wind currents entering downtown centers' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 1 explains that dark, impermeable surfaces absorb solar radiation and re-radiate heat overnight.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'What does the word "impermeable" mean in the context of urban surfaces?',
        options: [
          { id: 'A', text: 'Not allowing fluid or moisture to pass through' },
          { id: 'B', text: 'Extremely soft and easily damaged' },
          { id: 'C', text: 'Made entirely from natural organic materials' },
          { id: 'D', text: 'Transparent to the human eye' },
        ],
        correctAnswer: 'A',
        explanation: '"Impermeable" surfaces like concrete prevent water and fluids from passing through.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'Who inspired the micro-forest methodology described in the text?',
        options: [
          { id: 'A', text: 'Japanese botanist Akira Miyawaki' },
          { id: 'B', text: 'A team of automobile engineers in Tokyo' },
          { id: 'C', text: 'European historical geographers' },
          { id: 'D', text: 'An ancient agricultural community' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 mentions Japanese botanist Akira Miyawaki as the pioneer of the dense micro-forest method.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'How much faster do Miyawaki micro-forests grow compared to conventional parkland?',
        options: [
          { id: 'A', text: 'Up to ten times faster' },
          { id: 'B', text: 'Two times slower' },
          { id: 'C', text: 'At exactly the same rate' },
          { id: 'D', text: 'One hundred times slower' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 explicitly states that micro-forests grow up to ten times faster.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'By how much can neighborhood ambient temperatures drop due to micro-forest evapotranspiration?',
        options: [
          { id: 'A', text: 'Up to four degrees Celsius' },
          { id: 'B', text: 'More than twenty degrees Fahrenheit' },
          { id: 'C', text: 'Less than half a degree' },
          { id: 'D', text: 'Temperatures actually increase' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 notes that evapotranspiration and shade can lower neighborhood temperatures by up to four degrees Celsius.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'Which additional environmental benefit of micro-forests is highlighted in paragraph 4?',
        options: [
          { id: 'A', text: 'Absorbing fine particulate matter and sequestering carbon' },
          { id: 'B', text: 'Increasing industrial noise pollution' },
          { id: 'C', text: 'Preventing birds from nesting in city limits' },
          { id: 'D', text: 'Raising the cost of city water utilities' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 4 lists particulate absorption, carbon sequestration, and habitat restoration as key benefits.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'Where can micro-forests be successfully planted according to the passage?',
        options: [
          { id: 'A', text: 'Pocket parks, vacant lots, and highway medians' },
          { id: 'B', text: 'Exclusively in remote mountain ranges' },
          { id: 'C', text: 'Underground transit tunnels' },
          { id: 'D', text: 'Inside commercial warehouse rooftops only' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 mentions planting in pocket parks, vacant lots, and highway medians.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'What can be inferred about the cost-effectiveness of urban micro-forests?',
        options: [
          { id: 'A', text: 'They offer an economically viable solution for urban climate resilience' },
          { id: 'B', text: 'They are financially bankrupting every city that implements them' },
          { id: 'C', text: 'They require more funding than constructing massive steel domes' },
          { id: 'D', text: 'They produce zero measurable environmental return' },
        ],
        correctAnswer: 'A',
        explanation: 'The conclusion describes micro-forests as a cost-effective strategy for climate resilience.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What is the primary conclusion drawn by the author?',
        options: [
          { id: 'A', text: 'Transforming gray urban infrastructure into green canopies improves resilience and livability' },
          { id: 'B', text: 'Cities should completely ban all plant life to prevent insect migration' },
          { id: 'C', text: 'Urban heat islands have no impact on human wellbeing' },
          { id: 'D', text: 'Asphalt surfaces should replace all remaining natural forests' },
        ],
        correctAnswer: 'A',
        explanation: 'The author concludes that greening city landscapes is essential for climate resilience and environmental health.',
      },
    ],
  },
  {
    topic: 'The Cognitive Science of Multilingualism',
    level: 'B2',
    title: 'The Cognitive Science of Multilingualism',
    wordCount: 320,
    difficultWords: ['Neuroplasticity', 'Dorsolateral', 'Multilingualism', 'Inhibition', 'Reserve'],
    passage: `For decades, mid-twentieth-century educators cautioned that teaching children multiple languages simultaneously would induce linguistic confusion and cognitive delay. Contemporary neuroscience, however, has thoroughly overturned this misconception, revealing that multilingualism provides profound neurological advantages across the human lifespan.\n\nNeuroimaging studies demonstrate that managing two or more linguistic systems engages the brain’s executive control center, situated predominantly in the prefrontal cortex. Because both languages remain perpetually active in a bilingual individual’s mind, the brain must continuously employ selective attention and cognitive inhibition to suppress the non-target language while speaking.\n\nThis continuous mental workout strengthens neural pathways and bolsters neuroplasticity. Consequently, multilingual individuals consistently outperform monolingual peers on tasks requiring cognitive flexibility, task-switching, and abstract problem solving.\n\nFurthermore, epidemiological research indicates that lifelong bilingualism builds cognitive reserve. When neurodegenerative conditions such as Alzheimer’s disease develop, bilingual patients demonstrate symptomatic onset four to five years later than monolinguals with identical brain pathology. The ability to navigate multiple languages literally reshapes and protects the human brain.`,
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the main idea of the passage?',
        options: [
          { id: 'A', text: 'Multilingualism strengthens brain function, cognitive flexibility, and neurological reserve' },
          { id: 'B', text: 'Children should never learn a second language before adulthood' },
          { id: 'C', text: 'Alzheimer’s disease has been completely eradicated through grammar drills' },
          { id: 'D', text: 'Monolingual individuals possess faster physical reaction times' },
        ],
        correctAnswer: 'A',
        explanation: 'The passage explores the neurological and cognitive benefits of knowing multiple languages.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'What historic misconception about bilingual children is mentioned in paragraph 1?',
        options: [
          { id: 'A', text: 'That learning multiple languages would cause linguistic confusion and delays' },
          { id: 'B', text: 'That bilingual children would refuse to speak any language' },
          { id: 'C', text: 'That bilingualism made children overly athletic' },
          { id: 'D', text: 'That bilingual children could not learn mathematical concepts' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 1 mentions the outdated 20th-century myth that bilingualism caused confusion and cognitive delay.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'Which region of the brain is responsible for executive control in language management?',
        options: [
          { id: 'A', text: 'The prefrontal cortex' },
          { id: 'B', text: 'The occipital lobe' },
          { id: 'C', text: 'The spinal cord' },
          { id: 'D', text: 'The auditory canal' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 identifies the prefrontal cortex as the executive control center.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'Why does a bilingual person’s brain experience a constant mental workout?',
        options: [
          { id: 'A', text: 'Both languages remain active, requiring selective attention to suppress the unused one' },
          { id: 'B', text: 'They must translate every single word into Latin first' },
          { id: 'C', text: 'They are forced to speak twice as loudly' },
          { id: 'D', text: 'Their brains produce less glucose during conversations' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 explains that both linguistic systems stay active, requiring continuous cognitive inhibition.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'What is the meaning of "cognitive inhibition" as used in paragraph 2?',
        options: [
          { id: 'A', text: 'The mental ability to suppress irrelevant or distracting information' },
          { id: 'B', text: 'A total inability to think or remember words' },
          { id: 'C', text: 'The physical fear of speaking in front of an audience' },
          { id: 'D', text: 'The rapid memorization of historical facts' },
        ],
        correctAnswer: 'A',
        explanation: 'Cognitive inhibition refers to deliberately suppressing the non-target language.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'In which cognitive tasks do multilinguals consistently outperform monolinguals?',
        options: [
          { id: 'A', text: 'Cognitive flexibility, task-switching, and abstract problem solving' },
          { id: 'B', text: 'Memorizing phone numbers without understanding them' },
          { id: 'C', text: 'Sleeping for fewer hours each night' },
          { id: 'D', text: 'Typing without looking at the keyboard' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 notes superior performance in flexibility, task-switching, and abstract problem solving.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'What is "cognitive reserve" according to epidemiological research in paragraph 4?',
        options: [
          { id: 'A', text: 'Resilience against neuropathology that delays symptomatic onset of brain diseases' },
          { id: 'B', text: 'A special vitamin stored in the brain tissues' },
          { id: 'C', text: 'The ability to speak without taking a breath' },
          { id: 'D', text: 'A permanent immunity to all neurological illnesses' },
        ],
        correctAnswer: 'A',
        explanation: 'Cognitive reserve allows the brain to compensate for pathology, delaying symptoms.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'By how many years do bilinguals demonstrate delayed symptoms of Alzheimer’s disease?',
        options: [
          { id: 'A', text: 'Four to five years later than monolinguals' },
          { id: 'B', text: 'Twenty to thirty years later' },
          { id: 'C', text: 'Only a few days later' },
          { id: 'D', text: 'There is no measurable difference' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 4 explicitly cites a 4 to 5 year delay in symptomatic onset.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'What does the term "neuroplasticity" refer to in the text?',
        options: [
          { id: 'A', text: 'The brain\'s ability to reorganize and form new neural connections' },
          { id: 'B', text: 'Artificial implants placed inside the skull' },
          { id: 'C', text: 'The rigid inflexibility of adult brain cells' },
          { id: 'D', text: 'A medical procedure to remove brain tissue' },
        ],
        correctAnswer: 'A',
        explanation: 'Neuroplasticity is the brain\'s capacity to adapt, grow, and restructure neural pathways.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'Which statement summarizes the author’s final thought?',
        options: [
          { id: 'A', text: 'Navigating multiple languages physically reshapes and fortifies the human brain' },
          { id: 'B', text: 'Language learning should only be pursued for economic travel reasons' },
          { id: 'C', text: 'Modern neuroscience supports the 1950s view on childhood confusion' },
          { id: 'D', text: 'Learning languages becomes impossible past childhood' },
        ],
        correctAnswer: 'A',
        explanation: 'The conclusion underscores that multilingualism actively reshapes and protects the brain.',
      },
    ],
  },
  {
    topic: 'The Economics of Circular Packaging',
    level: 'B2',
    title: 'The Economics of Circular Packaging',
    wordCount: 315,
    difficultWords: ['Circularity', 'Obsolescence', 'Degradation', 'Logistics', 'Incentives'],
    passage: `For over half a century, global consumer goods industries operated on a linear take-make-dispose economic paradigm. Single-use plastic packaging, designed for transient convenience, generated massive ecological damage, filling oceanic gyres and terrestrial landfills.\n\nIn response to mounting environmental regulation and consumer scrutiny, pioneering enterprises are transitioning toward circular packaging models. Unlike traditional recycling—which often results in downcycling into lower-grade materials—circular packaging prioritizes closed-loop refill and standardized reuse systems.\n\nFrom an operational perspective, circularity requires sophisticated reverse logistics networks. Companies deploy sensor-tagged containers that consumers return via automated drop-off kiosks, receiving micro-deposits or loyalty credits. Specialized regional sanitization hubs clean, inspect, and reintroduce containers into supply chains up to fifty times.\n\nWhile initial capital investments in durable packaging and reverse infrastructure are substantial, lifecycle analyses demonstrate long-term economic dividends. By drastically diminishing raw resin procurement costs and avoiding escalating single-use packaging tariffs, circular models deliver compelling cost efficiency alongside profound ecological benefits.`,
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the primary subject of the passage?',
        options: [
          { id: 'A', text: 'The economic and operational transition to circular, reusable packaging systems' },
          { id: 'B', text: 'The history of petroleum extraction in maritime territories' },
          { id: 'C', text: 'Why single-use packaging remains the most economical permanent solution' },
          { id: 'D', text: 'The manufacturing of automated retail payment registers' },
        ],
        correctAnswer: 'A',
        explanation: 'The passage explores the economic rationale, operational systems, and benefits of circular packaging.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'What describes the traditional economic paradigm mentioned in paragraph 1?',
        options: [
          { id: 'A', text: 'A linear take-make-dispose model' },
          { id: 'B', text: 'A completely waste-free circular loop' },
          { id: 'C', text: 'A government-rationed distribution network' },
          { id: 'D', text: 'An organic barter exchange system' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 1 identifies the traditional system as a linear "take-make-dispose" paradigm.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'How does circular packaging differ from traditional recycling?',
        options: [
          { id: 'A', text: 'It prioritizes closed-loop refill and reuse rather than downcycling into lower-grade materials' },
          { id: 'B', text: 'It burns waste materials to generate electricity' },
          { id: 'C', text: 'It relies solely on biodegradable cardboard that degrades in water' },
          { id: 'D', text: 'It bans all consumer participation' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 contrasts circular reuse loops with traditional downcycling.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'What technological mechanism tracks reusable containers in the supply chain?',
        options: [
          { id: 'A', text: 'Sensor-tagged containers and automated drop-off kiosks' },
          { id: 'B', text: 'Handwritten paper receipts' },
          { id: 'C', text: 'Manual tally charts on clipboards' },
          { id: 'D', text: 'Satellite imagery tracking individual garbage cans' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 explains that sensor-tagged containers are tracked through automated kiosks.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'How many times can durable containers be reintroduced into the supply chain?',
        options: [
          { id: 'A', text: 'Up to fifty times' },
          { id: 'B', text: 'Only twice' },
          { id: 'C', text: 'Exactly one thousand times' },
          { id: 'D', text: 'They cannot be reused at all' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 states containers are sanitized and reused up to fifty times.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'What incentive motivates consumers to return packaging at kiosks?',
        options: [
          { id: 'A', text: 'Micro-deposits or loyalty credits' },
          { id: 'B', text: 'Threats of legal prosecution' },
          { id: 'C', text: 'Free international airline tickets' },
          { id: 'D', text: 'Mandatory civic service hours' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 notes that consumers receive micro-deposits or loyalty credits upon return.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'What initial challenge do companies face when adopting circular systems?',
        options: [
          { id: 'A', text: 'Substantial initial capital investments in durable packaging and reverse infrastructure' },
          { id: 'B', text: 'A total lack of consumer interest in sustainable brands' },
          { id: 'C', text: 'Strict government bans prohibiting package cleaning' },
          { id: 'D', text: 'Inability to clean glass or plastic surfaces' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 4 acknowledges that upfront capital investments in infrastructure are substantial.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'How do circular models achieve long-term economic dividends?',
        options: [
          { id: 'A', text: 'By diminishing raw resin procurement costs and avoiding single-use packaging tariffs' },
          { id: 'B', text: 'By charging consumers ten times more for food products' },
          { id: 'C', text: 'By eliminating all delivery vehicles' },
          { id: 'D', text: 'By operating without any cleaning or inspection standards' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 4 highlights savings from lower resin purchases and avoiding packaging tariffs.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'What does "reverse logistics" mean in the context of the passage?',
        options: [
          { id: 'A', text: 'The process of moving goods from consumers back to the manufacturer for reuse' },
          { id: 'B', text: 'Driving delivery trucks backwards to save fuel' },
          { id: 'C', text: 'Exporting domestic trash to overseas nations' },
          { id: 'D', text: 'Canceling customer orders before shipping' },
        ],
        correctAnswer: 'A',
        explanation: 'The conclusion emphasizes that circular models deliver compelling cost efficiency alongside ecological benefits.',
      },
    ],
  },
  {
    topic: 'Ocean Acidification and Coral Ecosystems',
    level: 'B2',
    title: 'Ocean Acidification and Coral Ecosystems',
    wordCount: 310,
    difficultWords: ['Acidification', 'Calcification', 'Carbonate', 'Ecosystem', 'Biodiversity'],
    passage: `Earth's oceans act as a massive planetary carbon sink, absorbing approximately thirty percent of anthropogenic carbon dioxide emissions released into the atmosphere. While this oceanic buffering mitigates atmospheric warming, it initiates a destructive chemical cascade known as ocean acidification.\n\nWhen carbon dioxide dissolves in seawater, it forms carbonic acid, which subsequently releases hydrogen ions. These surplus hydrogen ions bind with naturally occurring carbonate ions, drastically reducing the concentration of carbonate available in the water column.\n\nFor marine calcifying organisms—such as reef-building corals, mollusks, and microscopic plankton—carbonate ions are fundamental building blocks required to synthesize calcium carbonate shells and structural skeletons. In acidified waters, calcification rates plummet, and existing coral skeletons begin to dissolve.\n\nBecause coral reefs harbor over twenty-five percent of all marine species despite occupying less than one percent of the ocean floor, their degradation triggers trophic cascades, jeopardizing global fisheries, coastal storm protection, and marine biodiversity. Protecting these marine sanctuaries requires aggressive emissions reductions coupled with targeted reef restoration science.`,
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the primary subject of this passage?',
        options: [
          { id: 'A', text: 'The chemical causes of ocean acidification and its severe impacts on coral ecosystems' },
          { id: 'B', text: 'The navigation techniques of commercial cargo vessels' },
          { id: 'C', text: 'How to build artificial swimming pools in coastal regions' },
          { id: 'D', text: 'The history of deep-sea oil drilling' },
        ],
        correctAnswer: 'A',
        explanation: 'The passage explains how carbon absorption causes ocean acidification, harming calcifiers and coral reefs.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'How much human-produced carbon dioxide do the world’s oceans absorb?',
        options: [
          { id: 'A', text: 'Approximately thirty percent' },
          { id: 'B', text: 'Nearly one hundred percent' },
          { id: 'C', text: 'Less than one percent' },
          { id: 'D', text: 'Zero percent' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 1 states oceans absorb approximately thirty percent of anthropogenic CO2 emissions.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'What chemical acid is formed when carbon dioxide dissolves in seawater?',
        options: [
          { id: 'A', text: 'Carbonic acid' },
          { id: 'B', text: 'Sulfuric acid' },
          { id: 'C', text: 'Hydrochloric acid' },
          { id: 'D', text: 'Citric acid' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 explains that CO2 reacts with water to form carbonic acid.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'Why is the reduction of carbonate ions harmful to marine calcifiers?',
        options: [
          { id: 'A', text: 'Carbonate ions are the building blocks required to produce protective shells and skeletons' },
          { id: 'B', text: 'It increases water temperature beyond boiling' },
          { id: 'C', text: 'It makes ocean water completely transparent' },
          { id: 'D', text: 'It prevents fish from swimming in schools' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 highlights that carbonate ions are essential for synthesizing calcium carbonate shells.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'What does the term "calcification" mean in paragraph 3?',
        options: [
          { id: 'A', text: 'The biological process of depositing calcium salts to build hard structures' },
          { id: 'B', text: 'The evaporation of seawater under intense sunlight' },
          { id: 'C', text: 'The freezing of polar ice caps' },
          { id: 'D', text: 'The migration of deep-sea predators' },
        ],
        correctAnswer: 'A',
        explanation: 'Calcification is the biological formation of calcium-based hard shells and skeletal structures.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'What percentage of marine species depend on coral reefs for habitat?',
        options: [
          { id: 'A', text: 'Over twenty-five percent' },
          { id: 'B', text: 'Exactly one percent' },
          { id: 'C', text: 'Less than five percent' },
          { id: 'D', text: 'Nearly ninety percent' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 4 notes that reefs support over twenty-five percent of all marine species.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'How much of the total ocean floor do coral reefs occupy?',
        options: [
          { id: 'A', text: 'Less than one percent' },
          { id: 'B', text: 'Over fifty percent' },
          { id: 'C', text: 'Around twenty-five percent' },
          { id: 'D', text: 'Exactly eighty percent' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 4 states reefs occupy less than one percent of the ocean floor.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'What human benefit provided by coral reefs is mentioned in the final paragraph?',
        options: [
          { id: 'A', text: 'Coastal storm protection and support for global fisheries' },
          { id: 'B', text: 'Generating geothermal energy' },
          { id: 'C', text: 'Filtering freshwater for city tap systems' },
          { id: 'D', text: 'Creating gold and silver deposits' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 4 mentions fisheries support and coastal protection against ocean storms.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'What happens to existing coral skeletons when acidity levels rise high enough?',
        options: [
          { id: 'A', text: 'They begin to dissolve chemically' },
          { id: 'B', text: 'They turn into metallic iron' },
          { id: 'C', text: 'They become indestructible' },
          { id: 'D', text: 'They float to the ocean surface' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 notes that existing skeletons literally dissolve in acidified water.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What dual approach does the author recommend to protect coral ecosystems?',
        options: [
          { id: 'A', text: 'Aggressive emissions reductions combined with targeted reef restoration science' },
          { id: 'B', text: 'Harvesting all remaining coral for decorative jewelry' },
          { id: 'C', text: 'Draining shallow ocean lagoons' },
          { id: 'D', text: 'Replacing wild oceans with indoor glass aquariums' },
        ],
        correctAnswer: 'A',
        explanation: 'The conclusion advocates for reducing emissions alongside active reef restoration efforts.',
      },
    ],
  },
  {
    topic: 'Ethical Dimensions of Artificial Intelligence',
    level: 'B2',
    title: 'Ethical Dimensions of Artificial Intelligence',
    wordCount: 325,
    difficultWords: ['Provenance', 'Algorithmic', 'Governance', 'Transparency', 'Inference'],
    passage: `The rapid integration of machine learning systems into healthcare, judicial sentencing, and financial lending has sparked intense scrutiny regarding algorithmic ethics. While predictive algorithms offer unprecedented data processing velocity, they simultaneously present significant risks of automating and amplifying systemic human biases.\n\nAt the core of algorithmic fairness is the challenge of data provenance. Large artificial intelligence models are trained on historical datasets that inevitably reflect societal inequalities. When an algorithm infers statistical correlations from biased historical precedents, it codifies those inequities into automated decisions under a veneer of mathematical objectivity.\n\nCompounding this challenge is the opacity of deep neural networks—often referred to as the black-box dilemma. When complex models arrive at critical conclusions without providing interpretable rationales, individuals affected by adverse decisions cannot meaningful contest or inspect the underlying logic.\n\nEstablishing ethical AI governance requires multidisciplinary collaboration. Technologists and regulators must enforce rigorous algorithmic auditing, mandate explainable AI architectures, and ensure human-in-the-loop oversight for high-stakes societal decisions. Only through transparent standards can technology serve equitable human progress.`,
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the main theme of the passage?',
        options: [
          { id: 'A', text: 'The ethical challenges, systemic bias risks, and need for transparent governance in AI' },
          { id: 'B', text: 'How to build high-speed computer gaming graphics cards' },
          { id: 'C', text: 'Why all computer programs should be permanently disconnected' },
          { id: 'D', text: 'The financial stock performance of technology companies' },
        ],
        correctAnswer: 'A',
        explanation: 'The passage explores the ethics of machine learning, algorithmic bias, opacity, and governance.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'Which sectors utilizing machine learning are mentioned in the opening sentence?',
        options: [
          { id: 'A', text: 'Healthcare, judicial sentencing, and financial lending' },
          { id: 'B', text: 'Space tourism and entertainment theme parks' },
          { id: 'C', text: 'Farming and textile spinning' },
          { id: 'D', text: 'Commercial fishing and forestry' },
        ],
        correctAnswer: 'A',
        explanation: 'Sentence 1 lists healthcare, judicial sentencing, and financial lending as key sectors.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'Why do predictive algorithms risk amplifying systemic biases?',
        options: [
          { id: 'A', text: 'They are trained on historical datasets that reflect societal inequalities' },
          { id: 'B', text: 'Computers intentionally dislike human beings' },
          { id: 'C', text: 'Software code degrades when exposed to heat' },
          { id: 'D', text: 'They can only process numbers under one thousand' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 explains that algorithms learn and codify patterns from biased historical training data.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'What does the term "data provenance" refer to in paragraph 2?',
        options: [
          { id: 'A', text: 'The origin, lineage, and collection history of data' },
          { id: 'B', text: 'The physical size of a computer hard drive' },
          { id: 'C', text: 'The internet bandwidth used to download a file' },
          { id: 'D', text: 'The retail price of artificial intelligence software' },
        ],
        correctAnswer: 'A',
        explanation: '"Data provenance" describes the documented history, source, and custody of datasets.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'What is the "black-box dilemma" mentioned in paragraph 3?',
        options: [
          { id: 'A', text: 'The opacity of deep neural networks that make decisions without interpretable explanations' },
          { id: 'B', text: 'The physical flight recorder used in airplanes' },
          { id: 'C', text: 'A computer case painted completely black' },
          { id: 'D', text: 'A shortage of cardboard shipping containers' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 defines the black-box dilemma as the lack of interpretable rationales in complex models.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'Why is lack of model interpretability problematic for individuals receiving adverse decisions?',
        options: [
          { id: 'A', text: 'They cannot meaningfully inspect, understand, or contest the underlying logic' },
          { id: 'B', text: 'It prevents them from charging their mobile phones' },
          { id: 'C', text: 'It automatically deletes their bank accounts' },
          { id: 'D', text: 'It forces them to learn computer programming' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 3 notes that individuals cannot contest adverse automated outcomes if the logic is opaque.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'What does the author suggest to ensure high-stakes decisions remain ethical?',
        options: [
          { id: 'A', text: 'Enforcing human-in-the-loop oversight and explainable AI architectures' },
          { id: 'B', text: 'Eliminating all computer systems from hospitals' },
          { id: 'C', text: 'Allowing algorithms to make all legal judgments with zero human review' },
          { id: 'D', text: 'Hiding algorithm code from all regulatory bodies' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 4 advocates for explainable architectures, auditing, and human oversight.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'What is "algorithmic auditing" as described in the passage?',
        options: [
          { id: 'A', text: 'Independent evaluation to verify fairness, bias mitigation, and safety' },
          { id: 'B', text: 'Counting the number of lines in a software program' },
          { id: 'C', text: 'Selling user personal data to advertising companies' },
          { id: 'D', text: 'Increasing the electricity voltage of server processors' },
        ],
        correctAnswer: 'A',
        explanation: 'Algorithmic auditing involves rigorous testing to evaluate model fairness, bias, and performance.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'How does the author describe automated decisions that appear objective on the surface?',
        options: [
          { id: 'A', text: 'Operating under a veneer of mathematical objectivity while codifying bias' },
          { id: 'B', text: 'Completely infallible and free from all error' },
          { id: 'C', text: 'Purely emotional and unpredictable' },
          { id: 'D', text: 'Derived from ancient philosophical texts' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 2 notes algorithms present a false "veneer of mathematical objectivity".',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What is the concluding message of the author?',
        options: [
          { id: 'A', text: 'Transparent ethical governance is necessary for technology to foster equitable progress' },
          { id: 'B', text: 'Artificial intelligence development should be completely halted worldwide' },
          { id: 'C', text: 'Humans will be entirely replaced by algorithms within three years' },
          { id: 'D', text: 'Ethics and technology are inherently incompatible' },
        ],
        correctAnswer: 'A',
        explanation: 'The conclusion emphasizes that transparent standards allow technology to serve human progress equitably.',
      },
    ],
  },
];

export const generateReadingPassage = async (
  topic = null,
  level = 'B1',
  excludedTopics = [],
  sessionId = null,
  timestamp = Date.now()
) => {
  const selectedTopic = topic || 'The Architecture of Focus';

  const prompt = `You are an expert reading comprehension curriculum designer.
Generate an engaging reading passage and EXACTLY 10 multiple-choice questions for CEFR level "${level}" about "${selectedTopic}".
The passage must be between 280-340 words in length across 3-4 structured paragraphs.
You MUST provide EXACTLY 10 questions covering: main idea, details, vocabulary in context, inference, cause and effect, author's tone, and conclusion.
Exclude previously generated topics: ${JSON.stringify(excludedTopics)}.
Return ONLY valid JSON matching this schema:
{
  "topic": "${selectedTopic}",
  "level": "${level}",
  "title": "${selectedTopic}",
  "wordCount": 300,
  "passage": "Full passage text here with clear paragraphs...",
  "difficultWords": ["Word1", "Word2", "Word3", "Word4"],
  "questions": [
    {
      "id": 1,
      "number": 1,
      "prompt": "Question 1 prompt based strictly on passage?",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctAnswer": "A",
      "explanation": "Clear explanation referencing passage facts."
    }
  ]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);
    if (
      parsed &&
      parsed.passage &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length >= 10
    ) {
      parsed.questions = normalizeQuestions(parsed.questions.slice(0, 10)).map(shuffleQuestionOptions);
      return parsed;
    }
  } catch (error) {
    console.warn('[GeminiService] generateReadingPassage fallback active:', error.message);
  }

  // --- Resilient Nonce-Seeded Selection from 10-Question Passages Bank ---
  const seedString = `${sessionId || 'sess'}_${timestamp || Date.now()}_${level}_${Math.random()}`;
  let seedNum = 0;
  for (let i = 0; i < seedString.length; i++) {
    seedNum = (seedNum << 5) - seedNum + seedString.charCodeAt(i);
    seedNum |= 0;
  }
  const pseudoRandom = () => {
    seedNum = (seedNum * 9301 + 49297) % 233280;
    return Math.abs(seedNum) / 233280;
  };

  const excludedSet = new Set((excludedTopics || []).map((t) => String(t).toLowerCase().trim()));
  let candidatePool = READING_PASSAGES_BANK.filter(
    (p) => !excludedSet.has(p.topic.toLowerCase()) && !excludedSet.has(p.title.toLowerCase())
  );
  if (candidatePool.length === 0) {
    candidatePool = [...READING_PASSAGES_BANK];
  }

  // Pick fresh non-repeating passage
  const pickedIdx = Math.floor(pseudoRandom() * candidatePool.length);
  const chosenPassage = candidatePool[pickedIdx] || READING_PASSAGES_BANK[0];

  return {
    topic: chosenPassage.topic,
    level,
    title: chosenPassage.title,
    wordCount: chosenPassage.wordCount,
    passage: chosenPassage.passage,
    difficultWords: chosenPassage.difficultWords,
    questions: normalizeQuestions(
      chosenPassage.questions.map((q, idx) => ({
        ...q,
        id: idx + 1,
        number: idx + 1,
      }))
    ).map(shuffleQuestionOptions),
  };
};

// ==========================================
// 4. WRITING EVALUATOR (STRICT VALIDATION & TOPIC RELEVANCE)
// ==========================================
const getTopicKeywords = (topic = '') => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about',
    'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from',
    'up', 'down', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
    'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could',
    'become', 'standard', 'daily', 'routine', 'impact', 'advantages', 'importance'
  ]);
  const words = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  return Array.from(new Set(words));
};

export const computeOverallWritingScore = (ta, cc, lr, ga) => {
  const avg = (ta + cc + lr + ga) / 4;

  // 1. Severely low Task Achievement (<= 35, e.g. off-topic, irrelevant, or trivial response):
  // Task Achievement gates the overall score so an off-topic essay cannot receive a passing or high score.
  if (ta <= 35) {
    const weighted = 0.55 * ta + 0.15 * cc + 0.15 * lr + 0.15 * ga;
    return Math.max(5, Math.min(Math.round(weighted), Math.round(ta + 8), 40));
  }

  // 2. Moderately low Task Achievement (36 - 59, e.g. under-length or partially relevant):
  if (ta < 60) {
    const taWeight = 0.50 - (ta - 35) * 0.01;
    const remWeight = (1 - taWeight) / 3;
    const weighted = taWeight * ta + remWeight * cc + remWeight * lr + remWeight * ga;
    return Math.max(5, Math.min(Math.round(weighted), Math.round(ta + 12), 55));
  }

  // 3. Relevant, on-topic essays (TA >= 60):
  // Standard balanced average across the 4 criteria
  return Math.min(100, Math.max(0, Math.round(avg)));
};

export const evaluateWriting = async (topic = 'The Impact of Technology on Students', content = '', level = 'B1') => {
  const cleanContent = (content || '').trim();
  const words = cleanContent.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const topicKeywords = getTopicKeywords(topic);

  // --- 1. STRICT VALIDATION FOR EXTREMELY SHORT / TRIVIAL INPUTS (< 10 words, e.g. "hi", "test") ---
  if (wordCount < 10) {
    const isSingleGreeting = /^(hi|hello|hey|test|abc|asdf|ok|yes|no|good|bad|fine)$/i.test(cleanContent);
    const scoreVal = isSingleGreeting ? 5 : Math.max(5, Math.min(18, wordCount * 2));
    const grammarVal = isSingleGreeting ? 10 : Math.max(10, Math.min(25, wordCount * 3));
    const overall = computeOverallWritingScore(scoreVal, scoreVal, scoreVal, grammarVal);

    return {
      overallScore: overall,
      status: 'Needs Significant Development',
      wordCount,
      scores: {
        taskAchievement: scoreVal,
        coherenceAndCohesion: scoreVal,
        lexicalResource: scoreVal,
        grammarAndAccuracy: grammarVal,
      },
      feedback: {
        summary: `The submitted response is too short (only ${wordCount} word${wordCount === 1 ? '' : 's'}) to evaluate as an essay on "${topic}". The target length is 50–150 words.`,
        strengths: [],
        weaknesses: [
          `Response contains only ${wordCount} word${wordCount === 1 ? '' : 's'}, which is far below the 50-word minimum requirement.`,
          `The submission does not address or develop the assigned topic: "${topic}".`,
          'Lacks standard paragraph structure, supporting arguments, and concluding remarks.',
        ],
        suggestions: [
          `Write a complete response of at least 50–150 words focusing on "${topic}".`,
          'Structure your essay with an introductory statement, 2–3 supporting points, and a brief conclusion.',
          'Use complete English sentences with appropriate linking words (e.g. "Furthermore", "In addition", "Therefore").',
        ],
      },
      corrections: [],
      improvedVersion: `Over recent years, ${topic.toLowerCase()} has become an essential topic in modern education. For instance, digital tools provide students with instant access to learning resources, though managing screen time remains crucial. In conclusion, balanced usage helps learners achieve their full academic potential.`,
    };
  }

  // --- 2. AI EVALUATION PROMPT WITH STRICT RUBRICS ---
  const prompt = `You are a strict, professional CEFR English writing examiner.
Evaluate the student's writing submission strictly based on the ACTUAL TEXT provided.

Prompt/Topic: "${topic}"
Target CEFR Level: "${level}"
Required Length: 50–150 words
Submitted Content: "${cleanContent}"
Actual Word Count: ${wordCount}

STRICT EVALUATION CRITERIA (0–100 scale):
1. Task Achievement:
   - Does the response directly address "${topic}"?
   - If the essay is completely off-topic or irrelevant to "${topic}", Task Achievement MUST NOT exceed 25.
   - If word count is under 50 words (currently ${wordCount} words), penalize Task Achievement proportionally (maximum 45).
   - If word count is 50–150 words and directly addresses "${topic}", award a realistic score (65–95).
2. Coherence & Cohesion:
   - Logical flow, paragraph structure, and connecting phrases. If under 50 words or disjointed, score 20–50.
3. Lexical Resource:
   - Evaluates vocabulary range and appropriateness used in the actual submission.
4. Grammar & Accuracy:
   - Evaluates grammatical syntax, sentence structures, and punctuation in the actual submission.
5. Strengths & Weaknesses:
   - Do NOT praise prompt relevance if the essay is off-topic or underlength.
   - If response is under 50 words or off-topic, strengths MUST be empty [].

Return ONLY valid JSON matching this schema:
{
  "overallScore": 75,
  "status": "Proficient",
  "wordCount": ${wordCount},
  "scores": {
    "taskAchievement": 75,
    "coherenceAndCohesion": 75,
    "lexicalResource": 75,
    "grammarAndAccuracy": 75
  },
  "feedback": {
    "summary": "Objective assessment summary...",
    "strengths": ["Authentic strength 1"],
    "weaknesses": ["Specific weakness 1"],
    "suggestions": ["Actionable suggestion 1"]
  },
  "corrections": [
    {
      "original": "error snippet",
      "correction": "corrected snippet",
      "explanation": "why correction is needed"
    }
  ],
  "improvedVersion": "An exemplary 80-120 word model essay answering the topic."
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);

    if (parsed && parsed.scores && typeof parsed.scores.taskAchievement === 'number') {
      let ta = Math.min(100, Math.max(0, Math.round(parsed.scores.taskAchievement)));
      let cc = Math.min(100, Math.max(0, Math.round(parsed.scores.coherenceAndCohesion)));
      let lr = Math.min(100, Math.max(0, Math.round(parsed.scores.lexicalResource)));
      let ga = Math.min(100, Math.max(0, Math.round(parsed.scores.grammarAndAccuracy)));

      // Enforce under-length penalties
      if (wordCount < 50) {
        const lengthFactor = wordCount / 50;
        ta = Math.min(45, Math.round(ta * lengthFactor));
        cc = Math.min(55, Math.round(cc * (0.5 + 0.5 * lengthFactor)));
      }

      const calculatedOverall = computeOverallWritingScore(ta, cc, lr, ga);

      let status = 'Needs Significant Development';
      if (calculatedOverall >= 85) status = 'Excellent';
      else if (calculatedOverall >= 75) status = 'Proficient';
      else if (calculatedOverall >= 60) status = 'Good Progress';
      else if (calculatedOverall >= 40) status = 'Developing';

      let strengths = Array.isArray(parsed.feedback?.strengths) ? parsed.feedback.strengths : [];
      if (wordCount < 30 || calculatedOverall < 40) {
        strengths = [];
      }

      return {
        overallScore: calculatedOverall,
        status,
        wordCount,
        scores: {
          taskAchievement: ta,
          coherenceAndCohesion: cc,
          lexicalResource: lr,
          grammarAndAccuracy: ga,
        },
        feedback: {
          summary: parsed.feedback?.summary || `Essay evaluated for topic "${topic}".`,
          strengths,
          weaknesses: Array.isArray(parsed.feedback?.weaknesses) ? parsed.feedback.weaknesses : [],
          suggestions: Array.isArray(parsed.feedback?.suggestions) ? parsed.feedback.suggestions : [],
        },
        corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
        improvedVersion: parsed.improvedVersion || `A balanced response for "${topic}".`,
      };
    }
  } catch (error) {
    console.warn('[GeminiService] evaluateWriting fallback active:', error.message);
  }

  // --- 3. INTELLIGENT RULE-BASED FALLBACK EVALUATOR ---
  const lowerContent = cleanContent.toLowerCase();
  let matchedKeywords = 0;
  topicKeywords.forEach((kw) => {
    if (lowerContent.includes(kw)) matchedKeywords++;
  });

  const isRelevant = topicKeywords.length === 0 || matchedKeywords > 0;
  const sentences = cleanContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const lexicalDiversity = uniqueWords.size / Math.max(1, wordCount);

  let taskScore = 0;
  let coherenceScore = 0;
  let lexicalScore = 0;
  let grammarScore = 0;
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  if (wordCount < 50) {
    // Under minimum length
    const ratio = wordCount / 50;
    taskScore = isRelevant
      ? Math.min(45, Math.round(20 + ratio * 20 + matchedKeywords * 3))
      : Math.min(25, Math.round(10 + ratio * 15));
    coherenceScore = Math.min(50, Math.round(25 + ratio * 25));
    lexicalScore = Math.min(55, Math.round(30 + lexicalDiversity * 25));
    grammarScore = Math.min(65, Math.round(35 + (sentenceCount > 1 ? 15 : 0)));

    weaknesses.push(`Your submission is ${wordCount} words, which is below the 50-word minimum.`);
    if (!isRelevant) {
      weaknesses.push(`The text does not directly discuss key themes of "${topic}".`);
    }
    suggestions.push(`Expand your essay to 50–150 words by providing 2–3 concrete arguments on "${topic}".`);
    suggestions.push('Organize your thoughts into distinct introduction, body, and conclusion paragraphs.');
  } else {
    // 50+ words
    if (!isRelevant) {
      taskScore = 30; // Off-topic penalty
      coherenceScore = Math.min(75, 55 + Math.min(20, sentenceCount * 3));
      lexicalScore = Math.min(80, Math.round(50 + lexicalDiversity * 30));
      grammarScore = Math.min(80, Math.round(55 + (sentenceCount > 2 ? 15 : 5)));

      weaknesses.push(`Your essay does not directly address the assigned topic "${topic}".`);
      weaknesses.push('Even grammatically correct essays receive low Task Achievement and overall scores if they diverge from the prompt.');
      suggestions.push(`Ensure every paragraph directly relates to "${topic}".`);
    } else {
      // Relevant and sufficient length
      taskScore = Math.min(95, Math.round(72 + Math.min(15, matchedKeywords * 4) + Math.min(8, (wordCount - 50) / 10)));
      coherenceScore = Math.min(92, Math.round(70 + Math.min(15, sentenceCount * 3)));
      lexicalScore = Math.min(90, Math.round(68 + lexicalDiversity * 22));
      grammarScore = Math.min(92, Math.round(72 + (sentenceCount > 3 ? 12 : 5)));

      strengths.push(`Directly addressed the prompt topic: "${topic}".`);
      strengths.push(`Adequate essay length (${wordCount} words within the 50–150 target range).`);
      if (lexicalDiversity > 0.6) {
        strengths.push('Demonstrated good variety in vocabulary usage.');
      }

      weaknesses.push('Review sentence connectors to improve paragraph transitions.');
      weaknesses.push('Check for minor prepositional and punctuation precision.');
      suggestions.push('Incorporate more advanced transitional adverbs (e.g. "Consequently", "Nevertheless").');
      suggestions.push('Proofread for subject-verb agreement in complex sentences.');
    }
  }

  const calculatedOverall = computeOverallWritingScore(taskScore, coherenceScore, lexicalScore, grammarScore);
  let status = 'Needs Significant Development';
  if (calculatedOverall >= 85) status = 'Excellent';
  else if (calculatedOverall >= 75) status = 'Proficient';
  else if (calculatedOverall >= 60) status = 'Good Progress';
  else if (calculatedOverall >= 40) status = 'Developing';

  return {
    overallScore: calculatedOverall,
    status,
    wordCount,
    scores: {
      taskAchievement: taskScore,
      coherenceAndCohesion: coherenceScore,
      lexicalResource: lexicalScore,
      grammarAndAccuracy: grammarScore,
    },
    feedback: {
      summary: isRelevant && wordCount >= 50
        ? `Solid essay of ${wordCount} words addressing "${topic}".`
        : `Submission needs development: ${wordCount < 50 ? 'under 50 words' : 'does not address topic'}.`,
      strengths,
      weaknesses,
      suggestions,
    },
    corrections: [
      {
        original: words.slice(0, 4).join(' '),
        correction: `Regarding ${topic.toLowerCase()}, ...`,
        explanation: 'Enhance the sentence opening to establish clear contextual focus.',
      },
    ],
    improvedVersion: `In modern education, ${topic.toLowerCase()} plays a pivotal role in shaping student outcomes. Utilizing modern educational tools allows learners to collaborate effectively and access diverse perspectives worldwide. However, structured guidance and digital discipline remain vital to prevent distractions. Overall, when integrated purposefully, technology significantly enriches academic development.`,
  };
};

// ==========================================
// 5. LISTENING CONTENT GENERATOR (8 FULL 10-QUESTION LESSONS)
// ==========================================
const LISTENING_LESSONS_BANK = [
  {
    topic: 'At the Academic Support Center',
    title: 'Conversation: Academic Support Consultation',
    level: 'B1',
    transcript: `Speaker A: Good morning! Welcome to the University Academic Support Center. How can I help you today?
Speaker B: Hello! I am writing a research paper for my European History seminar, and I would like to schedule a consultation with a writing tutor.
Speaker A: Certainly! We have several specialized tutors. Are you looking for help with essay outlining, thesis formulation, or bibliography citations?
Speaker B: Mainly with organizing my body paragraphs and checking my Chicago-style footnotes.
Speaker A: Perfect. We have two available slots with our senior humanities tutor, Sarah. She is available on Tuesday afternoon at two o'clock or Thursday morning at ten o'clock.
Speaker B: Tuesday afternoons conflict with my biology laboratory class, so Thursday morning at ten works much better for me.
Speaker A: Wonderful. I have booked you for Thursday at ten in Room 204. Please bring two printed copies of your draft and your assignment rubric.
Speaker B: Should I also bring my laptop?
Speaker A: Yes, bringing your laptop is recommended in case you want to make immediate digital revisions during the forty-five-minute session.
Speaker B: Thank you very much for your assistance!`,
    wordBank: ['consultation', 'humanities', 'bibliography', 'citations', 'rubric', 'revisions'],
    tips: [
      'Listen for specific appointment times and reasons for rejection.',
      'Note what materials the student is asked to bring to the session.',
    ],
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'Why did the student visit the Academic Support Center?',
        options: [
          { id: 'A', text: 'To schedule a consultation with a writing tutor for a history paper' },
          { id: 'B', text: 'To pay semester university tuition fees' },
          { id: 'C', text: 'To borrow biology laboratory safety goggles' },
          { id: 'D', text: 'To register for a new foreign language course' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B explains they want to book a writing tutor for their European History research paper.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'Which specific areas does the student need assistance with?',
        options: [
          { id: 'A', text: 'Organizing body paragraphs and checking Chicago-style footnotes' },
          { id: 'B', text: 'Choosing a research paper topic from scratch' },
          { id: 'C', text: 'Translating text from French to English' },
          { id: 'D', text: 'Creating computer presentation slides' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B states: "Mainly with organizing my body paragraphs and checking my Chicago-style footnotes."',
      },
      {
        id: 3,
        number: 3,
        prompt: 'What is the name of the senior humanities writing tutor?',
        options: [
          { id: 'A', text: 'Sarah' },
          { id: 'B', text: 'Helen' },
          { id: 'C', text: 'Emily' },
          { id: 'D', text: 'Rachel' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A mentions: "our senior humanities tutor, Sarah."',
      },
      {
        id: 4,
        number: 4,
        prompt: 'Why did the student decline the Tuesday afternoon appointment?',
        options: [
          { id: 'A', text: 'It conflicts with their biology laboratory class' },
          { id: 'B', text: 'They had a dentist appointment' },
          { id: 'C', text: 'The library is closed on Tuesdays' },
          { id: 'D', text: 'They prefer studying late at night' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B explains that Tuesday afternoon conflicts with their biology lab.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'Which appointment slot was ultimately confirmed?',
        options: [
          { id: 'A', text: 'Thursday morning at ten o\'clock' },
          { id: 'B', text: 'Tuesday afternoon at two o\'clock' },
          { id: 'C', text: 'Wednesday morning at eleven o\'clock' },
          { id: 'D', text: 'Friday afternoon at three o\'clock' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B confirms Thursday morning at ten o\'clock.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'In which room will the tutoring session take place?',
        options: [
          { id: 'A', text: 'Room 204' },
          { id: 'B', text: 'Room 101' },
          { id: 'C', text: 'Room 312' },
          { id: 'D', text: 'Room 405' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A confirms: "booked you for Thursday at ten in Room 204."',
      },
      {
        id: 7,
        number: 7,
        prompt: 'What physical materials is the student requested to bring?',
        options: [
          { id: 'A', text: 'Two printed copies of the draft and the assignment rubric' },
          { id: 'B', text: 'A hardcover history textbook and a dictionary' },
          { id: 'C', text: 'A student ID card and cash for payment' },
          { id: 'D', text: 'A letter of recommendation from their professor' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A instructs: "bring two printed copies of your draft and your assignment rubric."',
      },
      {
        id: 8,
        number: 8,
        prompt: 'Why is bringing a laptop recommended?',
        options: [
          { id: 'A', text: 'To make immediate digital revisions during the session' },
          { id: 'B', text: 'To take an online multiple-choice examination' },
          { id: 'C', text: 'To record the audio of the conversation' },
          { id: 'D', text: 'To install university campus software' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A explains the laptop allows the student to make immediate digital revisions.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'How long will the consultation session last?',
        options: [
          { id: 'A', text: 'Forty-five minutes' },
          { id: 'B', text: 'Thirty minutes' },
          { id: 'C', text: 'Two hours' },
          { id: 'D', text: 'Fifteen minutes' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A specifies a "forty-five-minute session."',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What is the overall tone of Speaker A (the staff member)?',
        options: [
          { id: 'A', text: 'Professional, welcoming, and helpful' },
          { id: 'B', text: 'Impatient and critical' },
          { id: 'C', text: 'Uncertain and confused' },
          { id: 'D', text: 'Strict and confrontational' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A provides polite, clear, and accommodating guidance throughout the exchange.',
      },
    ],
  },
  {
    topic: 'The Environmental Science Seminar',
    title: 'Conversation: Renewable Energy Seminar',
    level: 'B1',
    transcript: `Speaker A: Good afternoon, everyone. In today's seminar, Dr. Evans will discuss municipal geothermal energy transition.
Speaker B: Thank you. Over the past three years, our pilot district replaced natural gas boilers with a closed-loop geothermal heat network.
Speaker A: What were the measurable carbon reduction results?
Speaker B: We achieved an immediate forty-five percent reduction in annual greenhouse gas emissions across forty civic buildings.
Speaker A: That is impressive. Were there major maintenance challenges during winter?
Speaker B: Because ground temperature remains stable at twelve degrees Celsius year-round, winter performance exceeded our models with zero pipe freezing.
Speaker A: What is the initial capital payback period?
Speaker B: Through state energy grants and reduced utility bills, the municipal council expects full capital amortization within seven years.
Speaker A: Are other nearby municipalities planning similar installations?
Speaker B: Yes, three neighboring towns have signed engineering contracts to begin construction next spring.`,
    wordBank: ['geothermal', 'municipal', 'emissions', 'amortization', 'infrastructure'],
    tips: [
      'Pay attention to percentages and numerical figures cited by the speaker.',
      'Note the timeline for capital payback and expansion plans.',
    ],
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the central topic of Dr. Evans\' seminar presentation?',
        options: [
          { id: 'A', text: 'A municipal closed-loop geothermal heating network' },
          { id: 'B', text: 'Solar panel installation in desert regions' },
          { id: 'C', text: 'Nuclear fission waste management policies' },
          { id: 'D', text: 'Offshore wind turbine blade construction' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Evans discusses replacing gas boilers with a municipal geothermal heat network.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'What percentage reduction in greenhouse gas emissions was achieved?',
        options: [
          { id: 'A', text: 'Forty-five percent' },
          { id: 'B', text: 'Twenty percent' },
          { id: 'C', text: 'Eighty percent' },
          { id: 'D', text: 'Ten percent' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Evans cites an "immediate forty-five percent reduction in annual greenhouse gas emissions."',
      },
      {
        id: 3,
        number: 3,
        prompt: 'How many civic buildings were included in the pilot project?',
        options: [
          { id: 'A', text: 'Forty buildings' },
          { id: 'B', text: 'Ten buildings' },
          { id: 'C', text: 'One hundred buildings' },
          { id: 'D', text: 'Five buildings' },
        ],
        correctAnswer: 'A',
        explanation: 'The speaker states the network covers forty civic buildings.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'At what temperature does the ground remain stable year-round?',
        options: [
          { id: 'A', text: 'Twelve degrees Celsius' },
          { id: 'B', text: 'Zero degrees Celsius' },
          { id: 'C', text: 'Twenty-five degrees Celsius' },
          { id: 'D', text: 'Five degrees Celsius' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Evans notes ground temperature remains stable at twelve degrees Celsius.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'How did the system perform during winter months?',
        options: [
          { id: 'A', text: 'It exceeded performance models with zero pipe freezing' },
          { id: 'B', text: 'It required emergency backup coal generators' },
          { id: 'C', text: 'It experienced severe structural leaks' },
          { id: 'D', text: 'It had to be shut down completely' },
        ],
        correctAnswer: 'A',
        explanation: 'The speaker notes winter performance exceeded models with no pipe freezing.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'What is the projected capital payback period for the municipality?',
        options: [
          { id: 'A', text: 'Seven years' },
          { id: 'B', text: 'Twenty-five years' },
          { id: 'C', text: 'Two years' },
          { id: 'D', text: 'Fifty years' },
        ],
        correctAnswer: 'A',
        explanation: 'The council expects full capital amortization within seven years.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'What financial mechanisms aid the project amortization?',
        options: [
          { id: 'A', text: 'State energy grants and reduced utility bills' },
          { id: 'B', text: 'Private lottery sales' },
          { id: 'C', text: 'Increasing property taxes by fifty percent' },
          { id: 'D', text: 'International banking loans with high interest' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Evans cites state energy grants and reduced utility expenses.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'How many neighboring towns have signed engineering contracts to adopt the system?',
        options: [
          { id: 'A', text: 'Three neighboring towns' },
          { id: 'B', text: 'Ten neighboring towns' },
          { id: 'C', text: 'Zero neighboring towns' },
          { id: 'D', text: 'Only one neighboring town' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Evans confirms that three neighboring towns have signed contracts.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'When will construction begin in the neighboring towns?',
        options: [
          { id: 'A', text: 'Next spring' },
          { id: 'B', text: 'Next winter' },
          { id: 'C', text: 'In five years' },
          { id: 'D', text: 'Immediately tomorrow morning' },
        ],
        correctAnswer: 'A',
        explanation: 'The speaker explicitly states construction will begin next spring.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What was the primary energy source replaced by the geothermal network?',
        options: [
          { id: 'A', text: 'Natural gas boilers' },
          { id: 'B', text: 'Diesel generators' },
          { id: 'C', text: 'Firewood stoves' },
          { id: 'D', text: 'Kerosene heaters' },
        ],
        correctAnswer: 'A',
        explanation: 'Paragraph 1 mentions replacing natural gas boilers with geothermal energy.',
      },
    ],
  },
  {
    topic: 'Airport Customs and Transit Terminal',
    title: 'Conversation: International Airport Transit',
    level: 'B1',
    transcript: `Speaker A: Good evening, sir. May I see your passport and international boarding pass?
Speaker B: Here you go. I have a connecting flight to Zurich leaving in two hours.
Speaker A: Thank you. Your connecting flight departs from Gate B24 in Terminal 2.
Speaker B: Do I need to collect my checked baggage here, or is it transferred automatically?
Speaker A: Because you booked on a single ticket, your luggage transfers directly to your final destination in Zurich.
Speaker B: Excellent. Where is the nearest security screening lane for transit passengers?
Speaker A: Take the escalator up to the third floor. Follow the green overhead signs for International Transfers.
Speaker B: Are liquids over one hundred milliliters permitted through the transfer security?
Speaker A: Only duty-free items purchased in the departure airport sealed in tamper-evident security bags with receipts are allowed.
Speaker B: Understood. Thank you for your guidance.`,
    wordBank: ['connecting', 'boarding pass', 'destination', 'transfers', 'tamper-evident'],
    tips: [
      'Identify gate numbers and airport terminal directions.',
      'Note the rules regarding checked baggage and liquid regulations.',
    ],
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the traveler’s final destination in the dialogue?',
        options: [
          { id: 'A', text: 'Zurich' },
          { id: 'B', text: 'Tokyo' },
          { id: 'C', text: 'London' },
          { id: 'D', text: 'Paris' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B mentions a connecting flight to Zurich.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'How much time does the passenger have before their connecting flight departs?',
        options: [
          { id: 'A', text: 'Two hours' },
          { id: 'B', text: 'Thirty minutes' },
          { id: 'C', text: 'Five hours' },
          { id: 'D', text: 'Twelve hours' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B states their flight leaves in two hours.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'From which gate does the flight to Zurich depart?',
        options: [
          { id: 'A', text: 'Gate B24 in Terminal 2' },
          { id: 'B', text: 'Gate A10 in Terminal 1' },
          { id: 'C', text: 'Gate C15 in Terminal 3' },
          { id: 'D', text: 'Gate D08 in the South Concourse' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A specifies Gate B24 in Terminal 2.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'What happens to the passenger’s checked luggage?',
        options: [
          { id: 'A', text: 'It transfers directly to Zurich automatically' },
          { id: 'B', text: 'The passenger must collect it from Carousel 4' },
          { id: 'C', text: 'It was lost during the first flight' },
          { id: 'D', text: 'It must be inspected at customs manually' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A explains that on a single ticket, luggage transfers directly to Zurich.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'Where is the transit security screening lane located?',
        options: [
          { id: 'A', text: 'On the third floor via the escalator' },
          { id: 'B', text: 'In the basement near the train station' },
          { id: 'C', text: 'Outside the airport exit doors' },
          { id: 'D', text: 'On the tarmac next to the aircraft' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A instructs the passenger to take the escalator to the third floor.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'What color are the overhead signs for International Transfers?',
        options: [
          { id: 'A', text: 'Green' },
          { id: 'B', text: 'Red' },
          { id: 'C', text: 'Yellow' },
          { id: 'D', text: 'Blue' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A states: "Follow the green overhead signs for International Transfers."',
      },
      {
        id: 7,
        number: 7,
        prompt: 'Under what condition are liquids over 100ml allowed through security?',
        options: [
          { id: 'A', text: 'If sealed in tamper-evident duty-free bags with receipts' },
          { id: 'B', text: 'If carried in a regular plastic grocery bag' },
          { id: 'C', text: 'They are never allowed under any circumstance' },
          { id: 'D', text: 'Only if frozen solid into ice blocks' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A clarifies duty-free items sealed in tamper-evident bags with receipts are permitted.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'What documents did Speaker A request initially?',
        options: [
          { id: 'A', text: 'Passport and international boarding pass' },
          { id: 'B', text: 'Driver’s license and hotel booking' },
          { id: 'C', text: 'Credit card and immunization record' },
          { id: 'D', text: 'Student identity card only' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A asks to see the passport and international boarding pass.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'Why does the luggage transfer automatically?',
        options: [
          { id: 'A', text: 'Because both flights were booked on a single ticket' },
          { id: 'B', text: 'Because the passenger paid an extra luggage fee' },
          { id: 'C', text: 'Because Zurich is a domestic destination' },
          { id: 'D', text: 'Because the passenger is flying in first class' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A confirms automatic transfer is due to booking on a single ticket.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What is the role of Speaker A in this dialogue?',
        options: [
          { id: 'A', text: 'An airport transit customer service agent' },
          { id: 'B', text: 'A flight attendant inside the airplane' },
          { id: 'C', text: 'A taxi driver outside the airport' },
          { id: 'D', text: 'A hotel front desk receptionist' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A is an airport ground staff agent assisting transit passengers.',
      },
    ],
  },
  {
    topic: 'Job Interview for Software Engineering Internship',
    title: 'Conversation: Technical Internship Interview',
    level: 'B1',
    transcript: `Speaker A: Welcome, Alex. Thank you for joining our engineering team interview today.
Speaker B: Good afternoon! It is a pleasure to meet you. I am excited about the full-stack internship.
Speaker A: Could you walk us through the collaborative web application featured on your portfolio?
Speaker B: Certainly. I built a real-time language flashcard platform using React on the frontend and Node.js on the backend.
Speaker A: How did your team coordinate version control and task distribution?
Speaker B: We used Git branches with pull request reviews, and conducted two-week agile sprint planning sessions with daily standups.
Speaker A: How did you test your server endpoints?
Speaker B: I wrote automated integration tests using Jest and Supertest to ensure ninety percent code coverage.
Speaker A: That sounds thorough. When would you be available to begin full-time summer onboarding?
Speaker B: I complete my academic final exams on June fifth, so I can start on Monday, June ninth.`,
    wordBank: ['full-stack', 'portfolio', 'integration', 'sprint', 'coverage', 'onboarding'],
    tips: [
      'Focus on technical tools and software frameworks mentioned by the candidate.',
      'Note the specific dates regarding academic exams and start availability.',
    ],
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What role is the candidate interviewing for?',
        options: [
          { id: 'A', text: 'A full-stack software engineering internship' },
          { id: 'B', text: 'A marketing graphic designer position' },
          { id: 'C', text: 'A university campus recruiter' },
          { id: 'D', text: 'A financial accounting specialist' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B expresses excitement about the full-stack internship.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'What application did Alex build for their portfolio project?',
        options: [
          { id: 'A', text: 'A real-time language flashcard platform' },
          { id: 'B', text: 'An online food delivery marketplace' },
          { id: 'C', text: 'A digital cryptocurrency wallet' },
          { id: 'D', text: 'A video streaming service' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B built a real-time language flashcard platform.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'Which technologies were used for the frontend and backend?',
        options: [
          { id: 'A', text: 'React on the frontend and Node.js on the backend' },
          { id: 'B', text: 'Flutter and Python Django' },
          { id: 'C', text: 'Angular and Ruby on Rails' },
          { id: 'D', text: 'Vue.js and PHP Laravel' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B mentions React frontend and Node.js backend.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'How did the student team coordinate project tasks?',
        options: [
          { id: 'A', text: 'Through two-week agile sprints and daily standups' },
          { id: 'B', text: 'By sending weekly email summaries' },
          { id: 'C', text: 'By working without any schedule' },
          { id: 'D', text: 'Through monthly phone calls' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B explains using two-week sprints and daily standups.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'Which testing frameworks were used to test server endpoints?',
        options: [
          { id: 'A', text: 'Jest and Supertest' },
          { id: 'B', text: 'Selenium and Cypress' },
          { id: 'C', text: 'JUnit and Mockito' },
          { id: 'D', text: 'PyTest and Postman' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B states writing automated tests using Jest and Supertest.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'What code coverage percentage was achieved in the testing suite?',
        options: [
          { id: 'A', text: 'Ninety percent' },
          { id: 'B', text: 'Fifty percent' },
          { id: 'C', text: 'Twenty-five percent' },
          { id: 'D', text: 'One hundred percent' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B mentions achieving ninety percent code coverage.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'When does Alex complete university final exams?',
        options: [
          { id: 'A', text: 'June fifth' },
          { id: 'B', text: 'May twentieth' },
          { id: 'C', text: 'July first' },
          { id: 'D', text: 'August tenth' },
        ],
        correctAnswer: 'A',
        explanation: 'Alex specifies: "I complete my academic final exams on June fifth."',
      },
      {
        id: 8,
        number: 8,
        prompt: 'On which date is Alex available to start the internship onboarding?',
        options: [
          { id: 'A', text: 'Monday, June ninth' },
          { id: 'B', text: 'Friday, June sixth' },
          { id: 'C', text: 'Monday, July first' },
          { id: 'D', text: 'Tuesday, May thirtieth' },
        ],
        correctAnswer: 'A',
        explanation: 'Alex confirms availability on Monday, June ninth.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'What version control workflow did the team implement?',
        options: [
          { id: 'A', text: 'Git branches with pull request code reviews' },
          { id: 'B', text: 'Copying files onto USB drives' },
          { id: 'C', text: 'Direct commits to the production server' },
          { id: 'D', text: 'Emailing zip archives' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker B notes using Git branches with pull request reviews.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What was the overall tone of the interviewer (Speaker A)?',
        options: [
          { id: 'A', text: 'Engaged, encouraging, and structured' },
          { id: 'B', text: 'Dismissive and uninterested' },
          { id: 'C', text: 'Overly aggressive and doubtful' },
          { id: 'D', text: 'Skeptical and confused' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A asks constructive technical questions and praises the candidate\'s thoroughness.',
      },
    ],
  },
  {
    topic: 'Community Healthcare Consultation',
    title: 'Conversation: Preventative Health Consultation',
    level: 'B1',
    transcript: `Speaker A: Good morning, Mr. Davis. I am Dr. Patel. How have you been feeling since our last checkup?
Speaker B: Overall quite well, doctor, but I have noticed mild fatigue in the late afternoons.
Speaker A: Let us review your preventative lifestyle habits. Are you engaging in regular cardiovascular exercise?
Speaker B: I try to do thirty minutes of brisk walking in the local park four mornings per week.
Speaker A: That is an excellent habit. How about your dietary sodium and hydration levels?
Speaker B: I drink about two liters of water daily, but I occasionally eat processed convenience foods when working late.
Speaker A: Reducing processed foods will significantly help your blood pressure and afternoon stamina.
Speaker B: Should we conduct routine laboratory blood tests today?
Speaker A: Yes, we will schedule a fasting lipid and glucose panel for next Tuesday morning at eight o'clock.
Speaker B: Understood. I will arrive fasting for twelve hours prior to the test.`,
    wordBank: ['preventative', 'cardiovascular', 'hydration', 'sodium', 'glucose', 'fasting'],
    tips: [
      'Notice the patient’s exercise routine and doctor’s recommendations.',
      'Pay attention to instructions for upcoming laboratory tests.',
    ],
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'Who is Dr. Patel consulting with in this dialogue?',
        options: [
          { id: 'A', text: 'Mr. Davis' },
          { id: 'B', text: 'Mr. Robinson' },
          { id: 'C', text: 'Dr. Evans' },
          { id: 'D', text: 'Officer Martinez' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Patel greets Mr. Davis at the start of the consultation.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'What symptom did Mr. Davis report experiencing?',
        options: [
          { id: 'A', text: 'Mild fatigue in the late afternoons' },
          { id: 'B', text: 'Severe lower back pain' },
          { id: 'C', text: 'Frequent morning headaches' },
          { id: 'D', text: 'Loss of taste and smell' },
        ],
        correctAnswer: 'A',
        explanation: 'Mr. Davis reports noticing mild fatigue in the late afternoons.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'What is Mr. Davis\' current physical exercise routine?',
        options: [
          { id: 'A', text: 'Thirty minutes of brisk walking four mornings per week' },
          { id: 'B', text: 'Intense weightlifting six days per week' },
          { id: 'C', text: 'Swimming one hour every evening' },
          { id: 'D', text: 'He does not exercise at all' },
        ],
        correctAnswer: 'A',
        explanation: 'Mr. Davis walks briskly for thirty minutes four mornings a week.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'How much water does Mr. Davis drink on a daily basis?',
        options: [
          { id: 'A', text: 'About two liters daily' },
          { id: 'B', text: 'Less than half a liter' },
          { id: 'C', text: 'Five liters daily' },
          { id: 'D', text: 'Only one cup of tea' },
        ],
        correctAnswer: 'A',
        explanation: 'Mr. Davis states drinking about two liters of water daily.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'What dietary adjustment does Dr. Patel recommend?',
        options: [
          { id: 'A', text: 'Reducing processed convenience foods to lower sodium' },
          { id: 'B', text: 'Eliminating all fresh fruits from the diet' },
          { id: 'C', text: 'Drinking four cups of espresso every morning' },
          { id: 'D', text: 'Eating only raw red meat' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Patel recommends reducing processed foods to improve blood pressure and stamina.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'Which laboratory tests are scheduled for the patient?',
        options: [
          { id: 'A', text: 'A fasting lipid and glucose blood panel' },
          { id: 'B', text: 'An emergency MRI brain scan' },
          { id: 'C', text: 'A full dental X-ray examination' },
          { id: 'D', text: 'A vision and hearing screening' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Patel orders a fasting lipid and glucose blood panel.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'When is the blood panel appointment scheduled?',
        options: [
          { id: 'A', text: 'Next Tuesday morning at eight o\'clock' },
          { id: 'B', text: 'This Friday afternoon at four o\'clock' },
          { id: 'C', text: 'In three months' },
          { id: 'D', text: 'Immediately right now' },
        ],
        correctAnswer: 'A',
        explanation: 'The appointment is set for next Tuesday morning at eight.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'How long must Mr. Davis fast before the blood test?',
        options: [
          { id: 'A', text: 'Twelve hours' },
          { id: 'B', text: 'Twenty-four hours' },
          { id: 'C', text: 'Two hours' },
          { id: 'D', text: 'No fasting is required' },
        ],
        correctAnswer: 'A',
        explanation: 'Mr. Davis confirms arriving fasting for twelve hours prior.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'Where does Mr. Davis typically do his brisk walking?',
        options: [
          { id: 'A', text: 'In the local park' },
          { id: 'B', text: 'On a commercial gym treadmill' },
          { id: 'C', text: 'Inside an indoor shopping mall' },
          { id: 'D', text: 'Along the mountain hiking trail' },
        ],
        correctAnswer: 'A',
        explanation: 'Mr. Davis mentions walking in the local park.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What primary health metric will benefit from reducing dietary sodium?',
        options: [
          { id: 'A', text: 'Blood pressure and sustained energy levels' },
          { id: 'B', text: 'Bone density in the legs' },
          { id: 'C', text: 'Eye color clarity' },
          { id: 'D', text: 'Hair growth rate' },
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Patel notes it will help blood pressure and afternoon stamina.',
      },
    ],
  },
  {
    topic: 'University Campus Housing Orientation',
    title: 'Conversation: Campus Housing Orientation',
    level: 'B1',
    transcript: `Speaker A: Welcome to Alder Hall, everyone! I am Marcus, your Resident Advisor for the academic year.
Speaker B: Hi Marcus! Could you clarify the community quiet hours policy for weekday study periods?
Speaker A: Absolutely. Designated quiet hours run from ten o'clock at night until seven o'clock in the morning on weekdays.
Speaker B: Where are the shared laundry facilities located in this building?
Speaker A: The laundry room is on the ground floor next to the student lounge. You can operate washers and dryers using your digital student card.
Speaker B: How does the building handle household recycling and compost waste?
Speaker A: Color-coded recycling bins for paper, plastics, and glass are located in the central courtyard near the bike racks.
Speaker B: What happens if a resident accidentally misplaces their room keycard?
Speaker A: You can visit the front reception desk twenty-four hours a day. The first replacement is free, but subsequent replacements incur a fifteen-dollar fee.
Speaker B: That is very reasonable. Thank you for the helpful orientation!`,
    wordBank: ['resident', 'advisor', 'designated', 'facilities', 'orientation', 'reception'],
    tips: [
      'Note specific policy hours and building floor locations.',
      'Pay attention to fees and procedures for key replacement.',
    ],
    questions: [
      {
        id: 1,
        number: 1,
        prompt: 'What is the name of the campus dormitory building?',
        options: [
          { id: 'A', text: 'Alder Hall' },
          { id: 'B', text: 'Oakwood Residence' },
          { id: 'C', text: 'Pinecrest Tower' },
          { id: 'D', text: 'Maple Manor' },
        ],
        correctAnswer: 'A',
        explanation: 'Speaker A welcomes everyone to Alder Hall.',
      },
      {
        id: 2,
        number: 2,
        prompt: 'What is Marcus’ role in the residence hall?',
        options: [
          { id: 'A', text: 'Resident Advisor' },
          { id: 'B', text: 'Campus Security Chief' },
          { id: 'C', text: 'University President' },
          { id: 'D', text: 'Dining Hall Chef' },
        ],
        correctAnswer: 'A',
        explanation: 'Marcus introduces himself as the Resident Advisor.',
      },
      {
        id: 3,
        number: 3,
        prompt: 'What are the designated weekday quiet hours?',
        options: [
          { id: 'A', text: '10:00 PM to 7:00 AM' },
          { id: 'B', text: 'Midnight to 6:00 AM' },
          { id: 'C', text: '8:00 PM to 8:00 AM' },
          { id: 'D', text: '11:00 PM to 9:00 AM' },
        ],
        correctAnswer: 'A',
        explanation: 'Marcus specifies quiet hours run from 10:00 PM until 7:00 AM.',
      },
      {
        id: 4,
        number: 4,
        prompt: 'Where is the shared laundry room located?',
        options: [
          { id: 'A', text: 'On the ground floor next to the student lounge' },
          { id: 'B', text: 'In the rooftop attic' },
          { id: 'C', text: 'In a separate building across the street' },
          { id: 'D', text: 'On the fourth floor hallway' },
        ],
        correctAnswer: 'A',
        explanation: 'Marcus confirms the laundry room is on the ground floor next to the lounge.',
      },
      {
        id: 5,
        number: 5,
        prompt: 'How do students operate the washing machines and dryers?',
        options: [
          { id: 'A', text: 'Using their digital student card' },
          { id: 'B', text: 'Using paper banknotes' },
          { id: 'C', text: 'Using physical brass tokens' },
          { id: 'D', text: 'They are completely free without cards' },
        ],
        correctAnswer: 'A',
        explanation: 'Marcus states washers and dryers operate using the digital student card.',
      },
      {
        id: 6,
        number: 6,
        prompt: 'Where are the color-coded recycling bins situated?',
        options: [
          { id: 'A', text: 'In the central courtyard near the bike racks' },
          { id: 'B', text: 'Inside every individual bedroom closet' },
          { id: 'C', text: 'Next to the front elevator on each floor' },
          { id: 'D', text: 'Outside the dining cafeteria exit' },
        ],
        correctAnswer: 'A',
        explanation: 'Recycling bins are located in the central courtyard near the bike racks.',
      },
      {
        id: 7,
        number: 7,
        prompt: 'How much is charged for a subsequent room keycard replacement after the first free replacement?',
        options: [
          { id: 'A', text: 'Fifteen dollars' },
          { id: 'B', text: 'Fifty dollars' },
          { id: 'C', text: 'Five dollars' },
          { id: 'D', text: 'One hundred dollars' },
        ],
        correctAnswer: 'A',
        explanation: 'Marcus specifies subsequent replacements incur a fifteen-dollar fee.',
      },
      {
        id: 8,
        number: 8,
        prompt: 'When is the front reception desk accessible to assist residents?',
        options: [
          { id: 'A', text: 'Twenty-four hours a day' },
          { id: 'B', text: 'Only between 9:00 AM and 5:00 PM' },
          { id: 'C', text: 'On weekends only' },
          { id: 'D', text: 'Monday mornings only' },
        ],
        correctAnswer: 'A',
        explanation: 'Marcus confirms the front desk is available twenty-four hours a day.',
      },
      {
        id: 9,
        number: 9,
        prompt: 'What materials can be placed in the courtyard recycling containers?',
        options: [
          { id: 'A', text: 'Paper, plastics, and glass' },
          { id: 'B', text: 'Old automobile batteries' },
          { id: 'C', text: 'Electronic computer monitors' },
          { id: 'D', text: 'Building construction debris' },
        ],
        correctAnswer: 'A',
        explanation: 'Marcus mentions color-coded bins for paper, plastics, and glass.',
      },
      {
        id: 10,
        number: 10,
        prompt: 'What is the tone and purpose of this conversation?',
        options: [
          { id: 'A', text: 'An informative campus dormitory orientation' },
          { id: 'B', text: 'A formal disciplinary hearing' },
          { id: 'C', text: 'A heated argument about noise complaints' },
          { id: 'D', text: 'A sales pitch for commercial furniture' },
        ],
        correctAnswer: 'A',
        explanation: 'Marcus provides clear orientation details and welcomes new residents.',
      },
    ],
  },
];

export const generateListeningContent = async (
  topic = null,
  level = 'B1',
  excludedLessons = [],
  sessionId = null,
  timestamp = Date.now()
) => {
  const selectedTopic = topic || 'At the Academic Support Center';

  const prompt = `You are an English listening comprehension designer.
Create a natural spoken English conversation for CEFR level "${level}" on "${selectedTopic}".
The dialogue should be approximately 150-200 words between Speaker A and Speaker B.
You MUST provide EXACTLY 10 multiple-choice questions based strictly on facts in the audio transcript.
Exclude previously generated topics: ${JSON.stringify(excludedLessons)}.
Return ONLY valid JSON matching this schema:
{
  "title": "Conversation: ${selectedTopic}",
  "topic": "${selectedTopic}",
  "level": "${level}",
  "transcript": "Speaker A: Line 1\\nSpeaker B: Line 2...",
  "wordBank": ["word1", "word2", "word3", "word4"],
  "tips": ["Listening tip 1", "Listening tip 2"],
  "questions": [
    {
      "id": 1,
      "number": 1,
      "prompt": "Question prompt based on transcript?",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctAnswer": "A",
      "explanation": "Explanation based on dialogue."
    }
  ]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);
    if (
      parsed &&
      parsed.transcript &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length >= 10
    ) {
      const norm = normalizeQuestions(parsed.questions.slice(0, 10));
      parsed.questions = norm.map(shuffleQuestionOptions);
      return parsed;
    }
  } catch (error) {
    console.warn('[GeminiService] generateListeningContent fallback active:', error.message);
  }

  // --- Resilient Nonce-Seeded Selection from 10-Question Listening Bank ---
  const seedString = `${sessionId || 'sess'}_${timestamp || Date.now()}_${level}_${Math.random()}`;
  let seedNum = 0;
  for (let i = 0; i < seedString.length; i++) {
    seedNum = (seedNum << 5) - seedNum + seedString.charCodeAt(i);
    seedNum |= 0;
  }
  const pseudoRandom = () => {
    seedNum = (seedNum * 9301 + 49297) % 233280;
    return Math.abs(seedNum) / 233280;
  };

  const excludedSet = new Set((excludedLessons || []).map((t) => String(t).toLowerCase().trim()));
  let candidatePool = LISTENING_LESSONS_BANK.filter(
    (l) => !excludedSet.has(l.topic.toLowerCase()) && !excludedSet.has(l.title.toLowerCase())
  );
  if (candidatePool.length === 0) {
    candidatePool = [...LISTENING_LESSONS_BANK];
  }

  const pickedIdx = Math.floor(pseudoRandom() * candidatePool.length);
  const chosenLesson = candidatePool[pickedIdx] || LISTENING_LESSONS_BANK[0];

  const normQuestions = normalizeQuestions(
    chosenLesson.questions.map((q, idx) => ({
      ...q,
      id: idx + 1,
      number: idx + 1,
    }))
  );

  return {
    title: chosenLesson.title,
    topic: chosenLesson.topic,
    level,
    transcript: chosenLesson.transcript,
    wordBank: chosenLesson.wordBank,
    tips: chosenLesson.tips,
    questions: normQuestions.map(shuffleQuestionOptions),
  };
};

// ==========================================
// 6. INITIAL ASSESSMENT GENERATOR
// ==========================================
export const generateAssessmentData = async (level = 'B1') => {
  const prompt = `You are a diagnostic English language assessment expert.
Generate a comprehensive 5-skill diagnostic assessment for CEFR level "${level}".
Return ONLY valid JSON matching this schema:
{
  "level": "${level}",
  "sections": {
    "grammar": [
      {
        "id": "g1",
        "prompt": "Select the correct sentence:",
        "options": [
          { "id": "A", "text": "He don't like coffee." },
          { "id": "B", "text": "He doesn't like coffee." }
        ],
        "correctAnswer": "B"
      }
    ],
    "vocabulary": [
      {
        "id": "v1",
        "prompt": "Choose the closest meaning to 'Reluctant':",
        "options": [
          { "id": "A", "text": "Eager" },
          { "id": "B", "text": "Unwilling" }
        ],
        "correctAnswer": "B"
      }
    ],
    "reading": {
      "title": "The Evolution of Communication",
      "passage": "Passage text...",
      "questions": [
        {
          "id": "r1",
          "prompt": "What is the topic?",
          "options": [
            { "id": "A", "text": "History" },
            { "id": "B", "text": "Communication evolution" }
          ],
          "correctAnswer": "B"
        }
      ]
    },
    "writing": {
      "prompt": "Write 100 words describing your favorite hobby."
    },
    "listening": {
      "transcript": "Dialogue...",
      "questions": [
        {
          "id": "l1",
          "prompt": "What was discussed?",
          "options": [
            { "id": "A", "text": "Travel" },
            { "id": "B", "text": "Project presentation" }
          ],
          "correctAnswer": "B"
        }
      ]
    }
  }
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);
    if (parsed && parsed.sections) {
      if (parsed.sections?.grammar) parsed.sections.grammar = normalizeQuestions(parsed.sections.grammar);
      if (parsed.sections?.vocabulary) parsed.sections.vocabulary = normalizeQuestions(parsed.sections.vocabulary);
      if (parsed.sections?.reading?.questions) parsed.sections.reading.questions = normalizeQuestions(parsed.sections.reading.questions);
      if (parsed.sections?.listening?.questions) parsed.sections.listening.questions = normalizeQuestions(parsed.sections.listening.questions);
      return parsed;
    }
  } catch (error) {
    console.warn('[GeminiService] generateAssessmentData fallback active:', error.message);
  }

  return {
    level,
    sections: {
      grammar: normalizeQuestions([
        {
          id: 'g1',
          prompt: 'Select the grammatically correct sentence:',
          options: [
            { id: 'A', text: 'She don\'t likes swimming.' },
            { id: 'B', text: 'She doesn\'t like swimming.' },
            { id: 'C', text: 'She isn\'t like swimming.' },
            { id: 'D', text: 'She not likes swim.' },
          ],
          correctAnswer: 'B',
        },
        {
          id: 'g2',
          prompt: 'Choose the correct Present Perfect sentence:',
          options: [
            { id: 'A', text: 'We have lived here for five years.' },
            { id: 'B', text: 'We has lived here since five years.' },
            { id: 'C', text: 'We are lived here for five years.' },
            { id: 'D', text: 'We living here since five years.' },
          ],
          correctAnswer: 'A',
        },
      ]),
      vocabulary: normalizeQuestions([
        {
          id: 'v1',
          prompt: 'Select the closest synonym for "Vibrant":',
          options: [
            { id: 'A', text: 'Dull and pale' },
            { id: 'B', text: 'Energetic and bright' },
            { id: 'C', text: 'Silent' },
            { id: 'D', text: 'Heavy' },
          ],
          correctAnswer: 'B',
        },
        {
          id: 'v2',
          prompt: 'What does "Diligent" mean?',
          options: [
            { id: 'A', text: 'Careless' },
            { id: 'B', text: 'Hardworking and persistent' },
            { id: 'C', text: 'Lazy' },
            { id: 'D', text: 'Impatient' },
          ],
          correctAnswer: 'B',
        },
      ]),
      reading: {
        title: 'The Digital Revolution',
        passage: 'Digital technology has fundamentally reshaped education, commerce, and communication across the globe. By connecting diverse communities, online networks foster cross-cultural collaboration and accelerate global knowledge sharing.',
        questions: normalizeQuestions([
          {
            id: 'r1',
            prompt: 'What is the main advantage of online networks mentioned in the text?',
            options: [
              { id: 'A', text: 'They eliminate the need for schools' },
              { id: 'B', text: 'They foster cross-cultural collaboration and knowledge sharing' },
              { id: 'C', text: 'They replace physical travel entirely' },
              { id: 'D', text: 'They reduce the need to read' },
            ],
            correctAnswer: 'B',
          },
        ]),
      },
      writing: {
        prompt: 'Describe a memorable personal experience in 50–100 words and explain what you learned from it.',
      },
      listening: {
        transcript: 'Speaker 1: Hi Sarah! Did you manage to submit the quarterly marketing report?\nSpeaker 2: Yes, I sent it to the management team this morning after finalizing the client feedback.',
        questions: normalizeQuestions([
          {
            id: 'l1',
            prompt: 'When did Sarah send the report?',
            options: [
              { id: 'A', text: 'Yesterday afternoon' },
              { id: 'B', text: 'This morning' },
              { id: 'C', text: 'Last Friday' },
              { id: 'D', text: 'Two hours ago' },
            ],
            correctAnswer: 'B',
          },
        ]),
      },
    },
  };
};

// ==========================================
// 7. TEST GENERATOR
// ==========================================
export const generateTestQuestions = async (category = 'Mixed', level = 'B1', count = 10, difficulty = 'Medium') => {
  const prompt = `You are a standardized English test author.
Generate a ${count}-question exam for category "${category}", CEFR level "${level}", difficulty "${difficulty}".
Do NOT include Speaking questions.
Return ONLY valid JSON matching this schema:
{
  "title": "${category} Comprehensive Test",
  "category": "${category}",
  "level": "${level}",
  "durationMinutes": 15,
  "totalQuestions": ${count},
  "questions": [
    {
      "id": 1,
      "category": "Grammar",
      "prompt": "Identify the grammatically correct sentence:",
      "options": [
        { "id": "A", "text": "If it will rain, we will stay home." },
        { "id": "B", "text": "If it rains, we will stay home." }
      ],
      "correctAnswer": "B",
      "explanation": "In first conditional sentences, the if-clause takes the simple present tense."
    }
  ]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      parsed.questions = normalizeQuestions(parsed.questions);
      return parsed;
    }
  } catch (error) {
    console.warn('[GeminiService] generateTestQuestions fallback active:', error.message);
  }

  return {
    title: `${category} Comprehensive Test`,
    category,
    level,
    durationMinutes: 15,
    totalQuestions: count,
    questions: normalizeQuestions([
      {
        id: 1,
        category: 'Grammar',
        prompt: 'Choose the correct conditional sentence:',
        options: [
          { id: 'A', text: 'If it will rain, we cancel.' },
          { id: 'B', text: 'If it rains, we will cancel the trip.' },
          { id: 'C', text: 'If it rained, we will cancel.' },
          { id: 'D', text: 'If it raining, we cancel.' },
        ],
        correctAnswer: 'B',
        explanation: 'First conditionals use simple present in the condition clause.',
      },
      {
        id: 2,
        category: 'Vocabulary',
        prompt: 'Select the synonym for "Persevere":',
        options: [
          { id: 'A', text: 'Surrender' },
          { id: 'B', text: 'Continue despite difficulties' },
          { id: 'C', text: 'Hesitate' },
          { id: 'D', text: 'Postpone' },
        ],
        correctAnswer: 'B',
        explanation: 'Persevere means to continue steadily in an action despite obstacles.',
      },
    ]),
  };
};

// ==========================================
// 8. AI COACH INTERACTIVE CHAT
// ==========================================
export const chatWithAICoach = async (messages = [], studentContext = {}) => {
  const systemInstruction = `You are the friendly, encouraging, and highly skilled AI English Coach for English360 AI.
Student Profile Context:
- Name: ${studentContext.name || 'Student'}
- Current Level: ${studentContext.englishLevel || 'Not Assessed'}
- Overall Score: ${studentContext.overallScore ?? 0}%
- Recent Weak Areas: ${studentContext.weakAreas?.join(', ') || 'None identified yet'}
- Study Streak: ${studentContext.streak ?? 0} days

Your goals:
1. Provide concise, clear, and actionable English feedback.
2. If the student asks about a grammar rule or word, explain with 2 simple example sentences.
3. Suggest targeted practice actions when relevant.
4. Keep a warm, motivating tone.`;

  const prompt = `${systemInstruction}

Conversation History:
${messages.map((m) => `${m.sender === 'user' ? 'Student' : 'AI Coach'}: ${m.text}`).join('\n')}

Student's Latest Message: "${messages[messages.length - 1]?.text || 'Hello'}"

Respond with JSON format:
{
  "reply": "Your helpful response here...",
  "suggestedActions": ["Practice Articles", "Review Past Tense", "Try Reading Passage"]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);
    if (parsed && parsed.reply) {
      return parsed;
    }
  } catch (error) {
    console.warn('[GeminiService] chatWithAICoach fallback active:', error.message);
  }

  const latestText = (messages[messages.length - 1]?.text || '').toLowerCase();
  let replyText = `Hello ${studentContext.name || 'Student'}! 👋 I'm your AI English Coach. I'm here to help you master grammar, expand vocabulary, and refine your reading and writing skills.`;

  if (latestText.includes('grammar') || latestText.includes('tense')) {
    replyText = `Great question! To master tenses:\n1. Focus on signal words (e.g. 'already' for Present Perfect, 'every day' for Present Simple).\n2. Practice forming positive, negative, and question forms.\nWould you like a few practice questions?`;
  } else if (latestText.includes('writing') || latestText.includes('essay')) {
    replyText = `For strong English writing:\n1. Use clear topic sentences for each paragraph.\n2. Add transition words like 'Furthermore', 'Consequently', and 'In conclusion'.\n3. Vary your sentence structures for natural rhythm.`;
  }

  return {
    reply: replyText,
    suggestedActions: ['Practice Grammar Tenses', 'Explore New Vocabulary', 'Read an Article'],
  };
};

// ==========================================
// 9. PERSONALIZED RECOMMENDATIONS ENGINE
// ==========================================
export const generatePersonalizedRecommendations = async (studentStats = {}, recentMistakes = []) => {
  const prompt = `Based on the following student performance data, generate 3 highly targeted, actionable recommendations:
- Level: ${studentStats.englishLevel || 'Not Assessed'}
- Overall Accuracy: ${studentStats.overallScore ?? 0}%
- Recent Mistake Topics: ${recentMistakes.map((m) => m.topic || m.category).slice(0, 5).join(', ') || 'Grammar Basics, Vocabulary'}

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Master Present Perfect Tense",
      "subtitle": "Targeted practice on verb agreement and auxiliary verbs.",
      "skill": "Grammar",
      "route": "/grammar",
      "color": "bg-indigo-50 text-brand-600"
    }
  ]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const parsed = cleanAndParseJSON(result.response.text(), null);
    if (parsed && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.warn('[GeminiService] generatePersonalizedRecommendations fallback active:', error.message);
  }

  return {
    recommendations: [
      {
        id: 'rec_1',
        title: 'Master Present Perfect & Past Tenses',
        subtitle: 'Review essential verb forms and time markers.',
        skill: 'Grammar',
        route: '/grammar',
        color: 'bg-indigo-50 text-brand-600',
      },
      {
        id: 'rec_2',
        title: 'Expand Academic Vocabulary',
        subtitle: 'Learn and quiz high-frequency CEFR words with flashcards.',
        skill: 'Vocabulary',
        route: '/vocabulary',
        color: 'bg-purple-50 text-purple-600',
      },
      {
        id: 'rec_3',
        title: 'Reading Speed & Comprehension',
        subtitle: 'Read active passages and evaluate your reading WPM.',
        skill: 'Reading',
        route: '/reading',
        color: 'bg-blue-50 text-blue-600',
      },
    ],
  };
};
