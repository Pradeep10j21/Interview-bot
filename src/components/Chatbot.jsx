import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

function Chatbot({ onClose, results }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI interview assistant. I can help you understand your results, provide tips for improvement, or answer questions about your performance. How can I help you?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(input, results);
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }, 1000);
  };

  const generateBotResponse = (userInput, results) => {
    const lowerInput = userInput.toLowerCase();
    const score = results?.overallScore || 0;

    if (lowerInput.includes('score') || lowerInput.includes('performance')) {
      return `Your overall score is ${score}%. This is ${score >= 70 ? 'excellent' : score >= 60 ? 'good' : 'needs improvement'}. Your strongest area is ${getStrongestSkill(results)}, and you should focus on improving ${getWeakestSkill(results)}.`;
    }

    if (lowerInput.includes('improve') || lowerInput.includes('better')) {
      return `Based on your results, I recommend: ${results?.improvements?.[0] || 'Practice speaking more clearly and provide more detailed answers'}. Also, try to use more technical terms when discussing your experience.`;
    }

    if (lowerInput.includes('strength') || lowerInput.includes('good')) {
      return `Your main strengths are: ${results?.strengths?.join(', ') || 'Clear communication and confidence'}. Keep building on these areas!`;
    }

    if (lowerInput.includes('question') || lowerInput.includes('answer')) {
      return `You answered ${results?.answers?.length || 0} questions. Your average answer length was good. Try to be more specific with examples in future interviews.`;
    }

    if (lowerInput.includes('help') || lowerInput.includes('what')) {
      return `I can help you with:\n• Understanding your scores\n• Improvement tips\n• Question analysis\n• Performance insights\n\nWhat would you like to know?`;
    }

    return `I understand you're asking about "${userInput}". Based on your interview results, I'd suggest focusing on clear communication and providing specific examples. Would you like more detailed feedback on any particular area?`;
  };

  const getStrongestSkill = (results) => {
    if (!results?.skillBreakdown) return 'communication';
    const { communication, confidence, technicalClarity } = results.skillBreakdown;
    if (communication >= confidence && communication >= technicalClarity) return 'communication';
    if (confidence >= technicalClarity) return 'confidence';
    return 'technical clarity';
  };

  const getWeakestSkill = (results) => {
    if (!results?.skillBreakdown) return 'technical clarity';
    const { communication, confidence, technicalClarity } = results.skillBreakdown;
    if (communication <= confidence && communication <= technicalClarity) return 'communication';
    if (confidence <= technicalClarity) return 'confidence';
    return 'technical clarity';
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <div className="chatbot-avatar">🤖</div>
          <div>
            <h3>AI Assistant</h3>
            <p>Ask me anything about your results</p>
          </div>
        </div>
        <button className="chatbot-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.text}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chatbot-input" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your results..."
          autoFocus
        />
        <button type="submit" disabled={!input.trim()}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18 2L9 11M18 2l-7 7M18 2H2l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default Chatbot;

