import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! Ask me anything about your spending — e.g. 'How much did I spend on food this month?'" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const question = input;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { question });
      setMessages((m) => [...m, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, I had trouble answering that.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 h-96 bg-white dark:bg-indigo-900 rounded-2xl shadow-2xl mb-3 flex flex-col overflow-hidden"
          >
            <div className="bg-brand-gradient text-white px-4 py-3 flex justify-between items-center">
              <span className="font-semibold text-sm">FinSage Assistant</span>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-sm px-3 py-2 rounded-xl max-w-[85%] ${
                    m.role === 'user'
                      ? 'bg-brand-indigo text-white ml-auto'
                      : 'bg-gray-100 dark:bg-indigo-800 text-gray-800 dark:text-white'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && <p className="text-xs text-gray-400">Thinking...</p>}
            </div>
            <div className="p-2 border-t flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about your finances..."
                className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
              <button onClick={send} className="bg-brand-teal text-white p-2 rounded-lg">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="bg-brand-gradient text-white p-4 rounded-full shadow-xl"
      >
        <MessageCircle size={22} />
      </motion.button>
    </div>
  );
}
