import mongoose from 'mongoose';

const questionAttemptSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const grammarProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    attempts: [questionAttemptSchema],
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalWrong: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

grammarProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export default mongoose.models.GrammarProgress ||
  mongoose.model('GrammarProgress', grammarProgressSchema);