import mongoose from 'mongoose';

const vocabularyProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    wordId: { type: String, required: true },
    word: { type: String, required: true },
    mastered: { type: Boolean, default: false },
    bookmarked: { type: Boolean, default: false },
    lastReviewed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.VocabularyProgress ||
  mongoose.model('VocabularyProgress', vocabularyProgressSchema);