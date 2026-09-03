import { chatWithAICoach, generatePersonalizedRecommendations } from '../services/geminiService.js';
import AICoachConversation from '../models/AICoachConversation.js';
import Mistake from '../models/Mistake.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const chatWithCoach = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const { messages = [] } = req.body;

    let user = null;
    let recentMistakes = [];
    try {
      user = await User.findOne({ firebaseUid: userId });
      recentMistakes = await Mistake.find({ userId }).sort({ createdAt: -1 }).limit(5);
    } catch (e) {
      // Ignored
    }

    const studentContext = {
      name: user?.name || req.user?.name || 'Student',
      englishLevel: user?.englishLevel || 'Not Assessed',
      overallScore: user?.overallScore ?? 0,
      weakAreas: recentMistakes.map(m => m.topic || m.category),
      streak: user?.streak ?? 0,
    };

    const aiReply = await chatWithAICoach(messages, studentContext);

    try {
      await AICoachConversation.create({
        userId,
        messages: [...messages, { sender: 'coach', text: aiReply.reply, time: new Date().toISOString() }],
      });
    } catch (e) {
      console.warn('[AICoach] Save conversation notice:', e.message);
    }

    return successResponse(res, aiReply, 'AI Coach responded successfully');
  } catch (error) {
    console.error('[AICoachController] chatWithCoach error:', error.message);
    return errorResponse(res, `AI Coach error: ${error.message}`, 500);
  }
};

export const getCoachRecommendations = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    let user = null;
    let recentMistakes = [];
    try {
      user = await User.findOne({ firebaseUid: userId });
      recentMistakes = await Mistake.find({ userId }).sort({ createdAt: -1 }).limit(5);
    } catch (e) {
      // Ignored
    }

    const recommendations = await generatePersonalizedRecommendations(
      user || { englishLevel: 'Not Assessed', overallScore: 0 },
      recentMistakes
    );

    return successResponse(res, recommendations, 'Personalized recommendations generated');
  } catch (error) {
    console.error('[AICoachController] getCoachRecommendations error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};
