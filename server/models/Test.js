import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Mixed', 'Grammar', 'Vocabulary', 'Reading', 'Listening'], default: 'Mixed' },
  level: { type: String, default: 'B1' },
  durationMinutes: { type: Number, default: 30 },
  totalQuestions: { type: Number, default: 20 },
  description: { type: String }
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model('Test', testSchema);