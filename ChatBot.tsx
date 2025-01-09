import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
}

interface QuickOption {
  id: string;
  text: string;
  action: string;
  icon: string;
  subOptions?: QuickOption[];
}

const quickOptions: QuickOption[] = [
  {
    id: '1',
    text: 'Appointments',
    action: 'category:appointments',
    icon: '🗓️',
    subOptions: [
      { id: '1-1', text: 'Book New', action: 'navigate:/appointments?new=true', icon: '📅' },
      { id: '1-2', text: 'View All', action: 'navigate:/appointments', icon: '👁️' },
      { id: '1-3', text: 'Reschedule', action: 'navigate:/appointments', icon: '🔄' }
    ]
  },
  {
    id: '2',
    text: 'Support',
    action: 'category:support',
    icon: '🏥',
    subOptions: [
      { id: '2-1', text: 'Emergency', action: 'navigate:/contact#emergency', icon: '🚨' },
      { id: '2-2', text: 'Find Doctor', action: 'navigate:/contact', icon: '👨‍⚕️' },
      { id: '2-3', text: 'Help', action: 'navigate:/contact', icon: '❓' }
    ]
  },
  {
    id: '3',
    text: 'Billing',
    action: 'category:billing',
    icon: '💳',
    subOptions: [
      { id: '3-1', text: 'View Bills', action: 'navigate:/billing', icon: '📄' },
      { id: '3-2', text: 'Pay Now', action: 'navigate:/billing?pay=true', icon: '💰' },
      { id: '3-3', text: 'Insurance', action: 'navigate:/billing#insurance', icon: '🏦' }
    ]
  },
  {
    id: '4',
    text: 'Records',
    action: 'category:records',
    icon: '📋',
    subOptions: [
      { id: '4-1', text: 'History', action: 'navigate:/dashboard', icon: '📚' },
      { id: '4-2', text: 'Results', action: 'navigate:/dashboard', icon: '🔬' },
      { id: '4-3', text: 'Meds', action: 'navigate:/dashboard', icon: '💊' }
    ]
  }
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    type: 'bot',
    content: 'Hi! How can I help you today?'
  }]);
  const [selectedOption, setSelectedOption] = useState<QuickOption | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputText.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedOption(null);
  };

  const handleQuickOption = (option: QuickOption) => {
    if (option.action.startsWith('category:')) {
      setSelectedOption(option);
    } else if (option.action.startsWith('navigate:')) {
      const path = option.action.replace('navigate:', '');
      navigate(path);
      setIsOpen(false);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.type === 'user';
    
    return (
      <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-100' : 'bg-white'
        }`}>
          {isUser ? (
            <span className="text-sm font-medium text-indigo-600">
              {user?.email?.charAt(0).toUpperCase() || 'P'}
            </span>
          ) : (
            <span className="text-lg">👩‍⚕️</span>
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col">
          <span className={`text-xs mb-1 ${isUser ? 'text-right' : ''}`}>
            {isUser ? 'You (Patient)' : 'Alana (AI Assistant)'}
          </span>
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              isUser
                ? 'bg-indigo-600 text-white ml-auto'
                : 'bg-white text-gray-800 shadow-sm'
            }`}
          >
            {message.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-lg shadow-xl flex flex-col" style={{ height: '400px' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-lg">👩‍⚕️</span>
              </div>
              <span className="font-medium text-sm">CareSync Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Quick Options */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {selectedOption?.subOptions ? (
                selectedOption.subOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleQuickOption(option)}
                    className="flex items-center space-x-2 p-2 text-left bg-white hover:bg-indigo-50 text-gray-800 rounded-lg border border-gray-200 transition-colors text-sm"
                  >
                    <span>{option.icon}</span>
                    <span className="truncate">{option.text}</span>
                  </button>
                ))
              ) : (
                quickOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleQuickOption(option)}
                    className="flex items-center space-x-2 p-2 text-left bg-white hover:bg-indigo-50 text-gray-800 rounded-lg border border-gray-200 transition-colors text-sm"
                  >
                    <span>{option.icon}</span>
                    <span className="truncate">{option.text}</span>
                  </button>
                ))
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-sm rounded-full px-3 py-1.5 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}