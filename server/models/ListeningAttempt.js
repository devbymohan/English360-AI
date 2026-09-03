import mongoose from 'mongoose';

const listeningAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    lessonId: {
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
    totalQuestions: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: String,
      default: '00:00',
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

const ListeningAttempt = mongoose.models.ListeningAttempt || mongoose.model('ListeningAttempt', listeningAttemptSchema);
export default ListeningAttempt;