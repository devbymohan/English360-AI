import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      required: true,
    },
    grammarScore: {
      type: Number,
      default: 0,
    },
    vocabularyScore: {
      type: Number,
      default: 0,
    },
    readingScore: {
      type: Number,
      default: 0,
    },
    writingScore: {
      type: Number,
      default: 0,
    },
    listeningScore: {
      type: Number,
      default: 0,
    },
    overallScore: {
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

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
export default Assessment;