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

  const generateSmartCoachReply = (text, studentName = 'Student') => {
    const q = text.trim().toLowerCase();

    if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|howdy)\b/.test(q)) {
      return {
        reply: `Hello ${studentName}! 👋 I am your English360 AI Personal Coach. What would you like to focus on today? We can master challenging grammar concepts, polish your essay writing, or boost your active vocabulary.`,
        suggestedActions: [
          'Explain Present Perfect vs Past Simple',
          'Tips for writing strong essays',
          'How to expand active vocabulary',
        ],
      };
    }

    if (q.includes('present perfect') || q.includes('past simple') || (q.includes('difference') && q.includes('past'))) {
      return {
        reply: `Great question! Here is how to distinguish **Present Perfect** from **Past Simple**:\n\n• **Past Simple** refers to completed past events with a specific, finished time marker:\n  *Example:* "I visited Kyoto **last year**."\n\n• **Present Perfect (have/has + past participle)** connects the past to the present moment, focusing on life experiences or results:\n  *Example:* "I **have visited** Kyoto three times." *(still true in my lifetime)*\n\n💡 **Quick Quiz:** How would you complete: *"She ________ (already / finalize) the design proposal"*?`,
        suggestedActions: [
          'She has already finalized',
          'Give me another practice sentence',
          'Explain Conditionals',
        ],
      };
    }

    if (q.includes('writing') || q.includes('essay') || q.includes('paragraph') || q.includes('structure')) {
      return {
        reply: `To write clear, cohesive English essays that score high on Task Achievement:\n\n1. **Direct Thesis Statement:** Answer the exact prompt in your introduction.\n2. **The PEEL Method for Body Paragraphs:**\n   • **Point:** State the main argument.\n   • **Explanation:** Clarify your reasoning.\n   • **Evidence/Example:** Provide a concrete illustration.\n   • **Link:** Reconnect to the central thesis.\n3. **Cohesive Devices:** Use transitional adverbs such as *Furthermore*, *Consequently*, and *Conversely*.\n\nWould you like feedback on an essay draft in the Writing module?`,
        suggestedActions: [
          'How to write a strong introduction',
          'Useful transition words for essays',
          'Practice writing an essay now',
        ],
      };
    }

    if (q.includes('vocabulary') || q.includes('words') || q.includes('remember') || q.includes('memorize')) {
      return {
        reply: `To convert passive words into fluent **active vocabulary**:\n\n1. **Study in Collocations:** Never learn isolated words; learn the whole phrase (e.g. *"make a decision"*, not just *"decision"*).\n2. **Immediate Production:** Compose an original sentence using the new word within 10 minutes of reading it.\n3. **Spaced Retrieval:** Test yourself using our Vocabulary Quiz tab 24 hours later.\n\nWhich CEFR level or topic words would you like to practice today?`,
        suggestedActions: [
          'Give me 3 advanced academic words',
          'Common business collocations',
          'Take a quick vocabulary quiz',
        ],
      };
    }

    return {
      reply: `That is an interesting topic! When learning English, regular practice and active application are key. Try using this concept in a complete sentence, or let me know if you would like me to break down the grammar, give you examples, or quiz you on it.`,
      suggestedActions: [
        'Explain Present Perfect vs Past Simple',
        'Tips for writing strong essays',
        'How to expand active vocabulary',
      ],
    };
  };

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
      } else {
        const studentName = user?.name || user?.displayName || 'Student';
        const smartFallback = generateSmartCoachReply(text, studentName);
        setMessages((prev) => [
          ...prev,
          { sender: 'coach', text: smartFallback.reply, time: 'Now' },
        ]);
        if (smartFallback.suggestedActions) {
          setSuggestedActions(smartFallback.suggestedActions);
        }
      }
    } catch (err) {
      const studentName = user?.name || user?.displayName || 'Student';
      const smartFallback = generateSmartCoachReply(text, studentName);
      setMessages((prev) => [
        ...prev,
        { sender: 'coach', text: smartFallback.reply, time: 'Now' },
      ]);
      if (smartFallback.suggestedActions) {
        setSuggestedActions(smartFallback.suggestedActions);
      }
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
              <span className="text-xs text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full font-bold">English360 AI</span>
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
