import React, { useState } from 'react';
import { FaRobot, FaCamera } from 'react-icons/fa6';
import ChatWidget from '../components/ai/ChatWidget';
import PlantScanner from '../components/ai/PlantScanner';
import styles from './AIAssistantPage.module.css';

function AIAssistantPage() {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <div>
      <h1 className="section-title"><FaRobot aria-hidden="true" /> AI Assistant</h1>

      <div className={styles.layout}>
        {/* Full-size chat */}
        <div className={styles.chatSection}>
          <ChatWidget />
        </div>

        {/* Scanner CTA */}
        <div className={styles.scanSection}>
          <div className={styles.scanCard}>
            <div className={styles.scanIcon}><FaCamera aria-hidden="true" /></div>
            <h3>Plant Disease Scanner</h3>
            <p>Upload a photo of your plant or soil to get an instant AI diagnosis and treatment recommendations.</p>
            <button className="btn btn-primary" onClick={() => setScannerOpen(true)}>
              <FaCamera aria-hidden="true" /> Open Scanner
            </button>
          </div>
        </div>
      </div>

      {scannerOpen && <PlantScanner onClose={() => setScannerOpen(false)} />}
    </div>
  );
}

export default AIAssistantPage;
