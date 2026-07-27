import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Minimize2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Clean and safe API URL construction
const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

const QUICK_SUGGESTIONS = [
  "🚗 Book a car",
  "💰 Pricing & Rates",
  "👨‍✈️ Driver availability",
  "❌ Cancellation policy"
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      loadChatHistory();
    } else if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Namaste! 👋 I'm your AI assistant at RentWheels. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/chat/history/${sessionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (data && Array.isArray(data) && data.length > 0) {
        const formattedMessages = data.flatMap(msg => [
          { text: msg.message, isUser: true, timestamp: msg.timestamp || new Date() },
          { text: msg.response, isUser: false, timestamp: msg.timestamp || new Date() },
        ]);
        setMessages(formattedMessages);
      } else {
        setMessages([
          {
            text: "Namaste! 👋 I'm your AI assistant at RentWheels. How can I help you today?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages([
        {
          text: "Namaste! 👋 I'm your AI assistant at RentWheels. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const getSmartFallbackResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('book') || q.includes('car') || q.includes('rent') || q.includes('vehicle')) {
      return "To book a vehicle, head over to the 'Vehicles' section, select your preferred ride, fill in your trip dates, and click 'Confirm Booking'!";
    }
    if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('pricing')) {
      return "Our vehicle rentals start at competitive daily rates. We also offer Ride Sharing discounts up to 50%!";
    }
    if (q.includes('driver')) {
      return "You can select the 'Driver Required' option during booking or match with top-rated drivers directly from your booking panel.";
    }
    if (q.includes('cancel')) {
      return "We offer free cancellation up to 24 hours before your pickup time directly from your user dashboard.";
    }
    return "Thanks for reaching out! You can browse our available vehicles, track live rides, or check your dashboard for active bookings.";
  };

  const sendMessage = async (textToSend) => {
    const messageText = textToSend || inputMessage.trim();
    if (!messageText) return;

    setInputMessage('');
    setMessages(prev => [...prev, { text: messageText, isUser: true, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/chat/message`,
        { message: messageText, sessionId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      setMessages(prev => [
        ...prev,
        { text: data.response || getSmartFallbackResponse(messageText), isUser: false, timestamp: new Date() },
      ]);
    } catch (error) {
      const fallbackReply = getSmartFallbackResponse(messageText);
      setMessages(prev => [
        ...prev,
        { text: fallbackReply, isUser: false, timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center border border-white/20"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}

      {/* Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col transition-all duration-200 ${
              isMinimized ? 'h-14 w-80' : 'h-[520px] w-[360px]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-none flex items-center gap-1">
                    RentWheels AI <Sparkles className="h-3 w-3 text-amber-300" />
                  </h4>
                  <span className="text-[10px] text-blue-100 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] p-3.5 rounded-2xl text-sm ${
                          msg.isUser
                            ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200/50 dark:border-gray-600/50'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <span className="text-[10px] opacity-60 mt-1 block text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Loading Dots */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/80 border-t dark:border-gray-700/60 overflow-x-auto flex gap-1.5 no-scrollbar">
                  {QUICK_SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion.replace(/^[^\w\s]+/, '').trim())}
                      className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask AI anything..."
                      className="flex-1 px-3.5 py-2 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={isLoading || !inputMessage.trim()}
                      className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 shadow-md"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;