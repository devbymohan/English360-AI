import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    testId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    skippedAnswers: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: String,
      default: '00:00',
    },
    sectionScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TestResult = mongoose.models.TestResult || mongoose.model('TestResult', testResultSchema);
export default TestResult;