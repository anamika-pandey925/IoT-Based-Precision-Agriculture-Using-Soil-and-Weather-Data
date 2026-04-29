import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaMicrophone, FaPaperPlane } from 'react-icons/fa6';
import aiService from '../../services/aiService';
import ChatMessage, { TypingIndicator } from './ChatMessage';
import styles from './AI.module.css';

const WELCOME = {
  id: 'welcome',
  role: 'bot',
  text: 'Namaste! Hello! 🌱 I\'m your AI Agri-Assistant. Ask me about crops, irrigation, fertilizer, or farming tips!',
};

function ChatWidget() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await aiService.ask(text.trim(), language);
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: data?.response || data?.message || 'I received your question. Please check your backend connection.',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: err.code === 'SERVER_DOWN'
          ? '⚠️ AI service is not connected. Please start the Flask backend.'
          : '⚠️ Something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'HI' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className={styles.chatWidget} role="region" aria-label="AI Agricultural Assistant">
      <div className={styles.chatHeader}>
        <div className={styles.chatTitle}>
          <FaRobot aria-hidden="true" />
          Agri-Assistant
        </div>
        <button
          className={`${styles.langBtn}${language === 'HI' ? ' ' + styles.active : ''}`}
          onClick={() => setLanguage((l) => l === 'EN' ? 'HI' : 'EN')}
          aria-label={`Switch to ${language === 'EN' ? 'Hindi' : 'English'}`}
        >
          {language}
        </button>
      </div>

      <div className={styles.messages} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.chatInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'HI' ? 'कुछ पूछें...' : 'Ask something... (e.g. which crop to grow?)'}
          aria-label="Type your question"
          autoComplete="off"
          disabled={isLoading}
        />
        <button
          className={`${styles.micBtn}${listening ? ' ' + styles.listening : ''}`}
          onClick={toggleMic}
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          title="Voice Input"
        >
          <FaMicrophone aria-hidden="true" />
        </button>
        <button
          className={styles.sendBtn}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          title="Send"
        >
          <FaPaperPlane aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default ChatWidget;
