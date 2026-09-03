import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    photoURL: {
      type: String,
      default: '',
    },
    englishLevel: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Not Assessed'],
      default: 'Not Assessed',
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyGoal: {
      type: Number,
      default: 20, // minutes per day
    },
    assessmentCompleted: {
      type: Boolean,
      default: false,
    },
    learningPreferences: {
      notifications: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      theme: { type: String, default: 'light' },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure no password field exists
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;