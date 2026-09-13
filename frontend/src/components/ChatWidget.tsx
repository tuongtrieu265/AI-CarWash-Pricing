import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import api from '../api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là **Trợ lý ảo AutoClean** 🤖. Tôi có thể giúp gì cho bạn về các gói dịch vụ rửa xe, chương trình đổi điểm ưu đãi, hay hướng dẫn đặt lịch hẹn hôm nay?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, timestamp: new Date() },
    ]);
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userText });
      const reply = res.data.reply || 'Xin lỗi, tôi không thể xử lý câu trả lời lúc này.';
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: reply, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Xin lỗi, tôi đang gặp lỗi kết nối. Bạn vui lòng thử lại sau nhé!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format simple markdown/bold text in messages
  const renderMessageText = (text: string) => {
    // Simple parser for **bold** text and newlines
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      // Handle simple list items formatting
      if (part.startsWith('- ')) {
        return <div key={idx} className="pl-2 py-0.5">• {part.slice(2)}</div>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      {/* Chat Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-sky-100 hover:shadow-sky-200 hover:scale-110 active:scale-95 transition-all cursor-pointer relative group"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          {/* Tooltip tooltip */}
          <div className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md">
            Hỏi trợ lý ảo AutoClean 🤖
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[500px] bg-white rounded-3xl border border-sky-100 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-xs">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  AutoClean AI
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-sky-100 font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Trực tuyến và sẵn sàng
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-sky-600" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-sky-500 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    {renderMessageText(m.text)}
                  </div>
                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      m.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading / Typing status indicator */}
            {loading && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="w-7 h-7 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-sky-600" />
                </div>
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-100 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn tại đây..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-200 outline-none transition-all text-xs font-medium placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-sky-500 text-white rounded-xl flex items-center justify-center hover:bg-sky-600 disabled:bg-slate-100 disabled:text-slate-400 transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
