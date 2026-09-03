import React, { useState } from 'react';
import { Bot, Send, Sparkles, CheckCircle2, ChevronRight, MessageSquare, BookOpen, Edit3, Award, Loader2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { aiCoachService } from '../services/aiCoachService';
import { useAuth } from '../context/AuthContext';

export const AICoachPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      text: `Hello ${user?.name || 'Student'}! 👋 I am your English360 AI Coach. How can I help you with your grammar, vocabulary, reading, or writing today?`,
      time: 'Now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState([
    'Explain Present Perfect vs Past Simple',
    'Tips for writing strong essays',
    'How to expand active vocabulary',
  ]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMsg = { sender: 'user', text, time: 'Now' };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsSending(true);

    try {
      const response = await aiCoachService.chat(updatedMessages);
      if (response && response.reply) {
        setMessages((prev) => [
          ...prev,
          { sender: 'coach', text: response.reply, time: 'Now' },
        ]);
        if (response.suggestedActions) {
          setSuggestedActions(response.suggestedActions);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: "I'm having a brief connection delay. Let me know what rule or topic you'd like to practice!",
          time: 'Now',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/40 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">AI Personal English Coach</h2>
              <p className="text-xs text-slate-500">
                Personalized advice tailored to your English level ({user?.level || 'B1'})
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
            {suggestedActions.map((pill) => (
              <button
                key={pill}
                onClick={() => handleSendMessage(pill)}
                disabled={isSending}
                className="px-2.5 sm:px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:border-brand-200 transition disabled:opacity-50 text-left"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Chat Window */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-4 sm:p-6 flex flex-col h-[480px] sm:h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-sm font-bold text-slate-900">Interactive Coaching Chat</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Gemini 2.5 Flash</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    m.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-indigo-100 text-brand-600'
                    }`}
                  >
                    {m.sender === 'user' ? (user?.name?.[0]?.toUpperCase() || 'U') : 'AI'}
                  </div>
                  <div
                    className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span
                      className={`text-[9px] block mt-1 ${
                        m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  <span>AI Coach is typing...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question about grammar, vocabulary, or writing..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSending}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              />
              <Button
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={isSending || !inputText.trim()}
                className="rounded-xl px-4"
              >
                <Send className="w-4 h-4 mr-1" /> Send
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Coaching Capabilities</h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Detailed grammatical explanations with simple example sentences.</li>
              <li>Vocabulary synonyms, antonyms, and collocations.</li>
              <li>Constructive writing essay evaluations and structure tips.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
