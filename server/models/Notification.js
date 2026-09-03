import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'assessment',
        'grammar',
        'vocabulary',
        'reading',
        'writing',
        'listening',
        'test',
        'milestone',
        'system',
      ],
      default: 'system',
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
