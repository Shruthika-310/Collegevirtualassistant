
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MOCK_SCHEDULE, GRIET_EXAM_FEES, GRIET_SYLLABUS } from '../constants';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AssistantProps {
  userRole?: 'student' | 'faculty';
}

const Assistant: React.FC<AssistantProps> = ({ userRole = 'student' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);

  // Initialize Chat Session
  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const scheduleStr = MOCK_SCHEDULE.map(s => `${s.time}: ${s.subject}`).join(', ');
    const feesStr = GRIET_EXAM_FEES.map(f => `${f.semester}: ₹${f.amount} (${f.status})`).join(', ');

    chatInstance.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are CampusBuddy, the official GRIET AI.
        Institutional Context:
        - College: GRIET (Gokaraju Rangaraju Institute of Engineering and Technology).
        - Location: Bachupally, Hyderabad.
        - Fests: Pragnya (Technical), Spices (Cultural), Pulse (Annual Day).
        - User Context: Role is ${userRole}.
        - Data: Schedules: ${scheduleStr}. Fees: ${feesStr}.
        
        Guidelines:
        - Be professional, helpful, and concise.
        - If asked about fees, verify against provided data.
        - For technical questions, provide clear explanations.
        - Do not mention you are an AI unless asked.`,
      },
    });

    // Welcome message
    setMessages([{
      id: 'welcome',
      text: `Hello! I'm CampusBuddy. How can I assist you with your ${userRole} portal today?`,
      isUser: false,
      timestamp: new Date()
    }]);
  }, [userRole]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatInstance.current.sendMessageStream({ message: text.trim() });
      
      let botMessageId = (Date.now() + 1).toString();
      let fullText = '';
      
      setMessages(prev => [...prev, {
        id: botMessageId,
        text: '',
        isUser: false,
        timestamp: new Date()
      }]);

      for await (const chunk of result) {
        const responseChunk = chunk as GenerateContentResponse;
        fullText += responseChunk.text;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I'm having trouble connecting to the GRIET servers. Please check your network.",
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
      {/* Chat Header */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/40">
            <i className="fas fa-robot text-xl"></i>
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight">CampusBuddy Chat</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">System Online • 2026 Proto</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages(messages.slice(0, 1))}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
          title="Clear Conversation"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 no-scrollbar"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[80%] flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
               <div className={`p-5 rounded-3xl shadow-sm text-sm font-medium leading-relaxed ${
                msg.isUser 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                {msg.text || (isTyping && !msg.isUser && <TypingIndicator />)}
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">
                {msg.isUser ? 'Verified Identity' : 'GRIET Assistant'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Suggestions */}
      {!isTyping && (
        <div className="px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white/50 border-t border-slate-50">
          {[
            "Next class?",
            "Exam fee status",
            "Attendance summary",
            "Fests in 2026"
          ].map(suggestion => (
            <button 
              key={suggestion}
              onClick={() => handleSend(suggestion)}
              className="whitespace-nowrap px-4 py-2 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-slate-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative flex items-center"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your campus query..."
            className="w-full pl-6 pr-20 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] font-bold text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`absolute right-3 p-4 rounded-2xl transition-all ${
              input.trim() && !isTyping 
                ? 'bg-orange-600 text-white shadow-xl shadow-orange-200 hover:bg-slate-900' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <i className={`fas ${isTyping ? 'fa-spinner animate-spin' : 'fa-paper-plane'}`}></i>
          </button>
        </form>
        <p className="mt-4 text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Secured by GRIET SmartCampus Protocol • End-to-End Encrypted
        </p>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-1 py-1">
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
  </div>
);

export default Assistant;
