import mongoose from 'mongoose';

const readingAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    passageId: {
      type: String,
      required: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number, // in seconds
      default: 0,
    },
    wpm: {
      type: Number,
      default: 0,
    },
    comprehensionScore: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
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

const ReadingAttempt = mongoose.models.ReadingAttempt || mongoose.model('ReadingAttempt', readingAttemptSchema);
export default ReadingAttempt;