import React from 'react';
import { FaRobot, FaUser } from 'react-icons/fa6';
import styles from './AI.module.css';

function ChatMessage({ message }) {
  const isBot = message.role === 'bot';
  return (
    <div className={`${styles.message} ${isBot ? styles.bot : styles.user}`}>
      <span className={styles.msgIcon} aria-hidden="true">
        {isBot ? <FaRobot /> : <FaUser />}
      </span>
      <div className={styles.msgBubble}>{message.text}</div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className={`${styles.message} ${styles.bot}`}>
      <span className={styles.msgIcon} aria-hidden="true"><FaRobot /></span>
      <div className={styles.typingBubble} aria-label="AI is typing">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

export default ChatMessage;
