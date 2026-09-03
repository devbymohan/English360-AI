import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Learning', 'Consistency', 'Performance', 'Special'],
      default: 'Learning',
    },
    points: { type: Number, default: 50 },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Achievement ||
  mongoose.model('Achievement', achievementSchema);