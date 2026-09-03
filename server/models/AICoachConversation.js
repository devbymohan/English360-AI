import mongoose from 'mongoose';

const aiCoachConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [
      {
        sender: { type: String, enum: ['user', 'coach'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    topic: {
      type: String,
      default: 'General Coaching',
    },
  },
  { timestamps: true }
);

const AICoachConversation =
  mongoose.models.AICoachConversation ||
  mongoose.model('AICoachConversation', aiCoachConversationSchema);

export default AICoachConversation;