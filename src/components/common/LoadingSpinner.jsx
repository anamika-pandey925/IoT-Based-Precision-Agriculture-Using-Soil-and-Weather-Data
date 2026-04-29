import React from 'react';
import { FaSpinner } from 'react-icons/fa6';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12)',
        gap: 'var(--space-4)',
        color: 'var(--text-muted)',
      }}
      role="status"
      aria-label={message}
    >
      <FaSpinner className="spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }} aria-hidden="true" />
      <span style={{ fontSize: 'var(--font-size-sm)' }}>{message}</span>
    </div>
  );
}

export default LoadingSpinner;
