import mongoose from 'mongoose';

const writingSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    grammarScore: {
      type: Number,
      default: 0,
    },
    vocabularyScore: {
      type: Number,
      default: 0,
    },
    clarityScore: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const WritingSubmission = mongoose.models.WritingSubmission || mongoose.model('WritingSubmission', writingSubmissionSchema);
export default WritingSubmission;