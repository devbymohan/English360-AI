import mongoose from 'mongoose';

const mistakeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    userAnswer: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'Practice',
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Mistake = mongoose.models.Mistake || mongoose.model('Mistake', mistakeSchema);
export default Mistake;