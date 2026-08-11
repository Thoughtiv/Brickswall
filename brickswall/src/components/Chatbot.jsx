import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../utils/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Bricks Wall AI Assistant. Ask me anything about our construction packages, pricing, projects, or services in Hyderabad. How can I help you build your dream property today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const messagesEndRef = useRef(null);

  const suggestionChips = [
    'What are your pricing packages?',
    'What locations do you cover?',
    'Tell me about warranty options',
    'Do you build commercial spaces?',
    'How can I contact you?'
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Hide tooltip after a few seconds or when opened
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Clear input if we are sending from input field
    if (!textToSend) {
      setInput('');
    }

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Keep only system-relevant history to avoid overloading token limits
      const apiMessages = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const data = await sendChatMessage(apiMessages);
      const assistantReply = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error processing your query. Please try again.';
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantReply }]);
    } catch (err) {
      console.error('Error sending chat message:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server right now. Please make sure the backend server is running.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="chatbot-floating-container">
      {/* Welcome Tooltip */}
      {showTooltip && !isOpen && (
        <div className="chatbot-tooltip animate-fade-in">
          <button className="tooltip-close" onClick={() => setShowTooltip(false)}>
            <X size={12} />
          </button>
          <div className="tooltip-content">
            <p className="tooltip-title">Have questions?</p>
            <p className="tooltip-sub">Ask our AI Construction Assistant!</p>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window animate-fade-in">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-active">
                <Bot size={20} className="text-white" />
                <span className="active-dot"></span>
              </div>
              <div>
                <h4>Bricks Wall Assistant</h4>
                <p>Typically replies instantly</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'assistant-wrapper'}`}>
                <div className="chat-bubble-avatar">
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble-wrapper assistant-wrapper">
                <div className="chat-bubble-avatar">
                  <Bot size={14} />
                </div>
                <div className="chat-bubble assistant-bubble typing-bubble">
                  <Loader2 size={16} className="animate-spin text-orange" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="chatbot-suggestions">
            {suggestionChips.map((chip, idx) => (
              <button key={idx} className="suggestion-chip" onClick={() => handleSendMessage(chip)} disabled={isLoading}>
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form className="chatbot-input-area" onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Ask about pricing, services, locations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="chatbot-send-btn" disabled={isLoading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
        {!isOpen && <span className="unread-dot"></span>}
      </button>
    </div>
  );
};

export default Chatbot;
