import mongoose from 'mongoose';

const learningActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['grammar', 'vocabulary', 'reading', 'writing', 'listening', 'test', 'assessment'],
      required: true,
    },
    score: {
      type: String,
      default: '100%',
    },
  },
  { timestamps: true }
);

const LearningActivity =
  mongoose.models.LearningActivity ||
  mongoose.model('LearningActivity', learningActivitySchema);

export default LearningActivity;