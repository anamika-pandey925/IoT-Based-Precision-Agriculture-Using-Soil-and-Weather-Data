import React, { useState, useRef } from 'react';
import { FaPlantWilt, FaCloudArrowUp, FaXmark, FaSpinner } from 'react-icons/fa6';
import aiService from '../../services/aiService';
import styles from './AI.module.css';

function PlantScanner({ onClose }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await aiService.predict(file);
      setResult(data);
    } catch (err) {
      setResult({
        disease: 'Error',
        confidence: 0,
        description: err.code === 'SERVER_DOWN'
          ? 'Backend not connected. Please start the Flask server.'
          : 'Scan failed. Please try again.',
        suggestions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.scanModal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.scanContent} role="dialog" aria-modal="true" aria-labelledby="scanTitle">
        <div className={styles.scanHeader}>
          <div className={styles.scanTitle} id="scanTitle">
            <FaPlantWilt aria-hidden="true" /> Plant Disease Scanner
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close scanner">
            <FaXmark aria-hidden="true" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          className={`${styles.dropZone}${dragOver ? ' ' + styles.dragOver : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Click or drag image to scan"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div className={styles.dropIcon}><FaCloudArrowUp aria-hidden="true" /></div>
          <p>Click or Drag &amp; Drop Image Here</p>
          <small>Supports JPG, PNG, WEBP</small>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
            aria-label="Upload image file"
          />
        </div>

        {/* Preview */}
        {preview && (
          <img src={preview} alt="Uploaded plant preview" className={styles.preview} />
        )}

        {/* Scan Button */}
        {file && !loading && (
          <button className="btn btn-primary w-full mt-4" onClick={handleScan}>
            Analyze Plant
          </button>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
            <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }} aria-hidden="true" />
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>Analyzing...</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={styles.resultBox} aria-live="polite">
            <div className={styles.resultName}>{result.disease || result.name || '--'}</div>
            {result.confidence !== undefined && (
              <div className={styles.confidenceBar} role="progressbar" aria-valuenow={result.confidence} aria-valuemin={0} aria-valuemax={100}>
                <div className={styles.confidenceFill} style={{ width: `${result.confidence}%` }} />
              </div>
            )}
            {result.description && (
              <p className={styles.resultDesc}>{result.description}</p>
            )}
            {result.suggestions?.length > 0 && (
              <>
                <strong style={{ fontSize: 'var(--font-size-sm)' }}>Suggestions:</strong>
                <ul className={styles.suggestionsList}>
                  {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlantScanner;
