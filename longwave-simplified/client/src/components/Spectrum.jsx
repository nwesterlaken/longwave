import { useState } from 'react';

function Spectrum({ leftLabel, rightLabel, target = null, guess = null, onGuessChange = null, showTarget = false }) {
  const [sliderValue, setSliderValue] = useState(guess !== null ? guess : 10);

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    if (onGuessChange) {
      onGuessChange(value);
    }
  };

  return (
    <div className="spectrum-container">
      {/* Labels */}
      <div className="flex justify-between mb-md">
        <div className="spectrum-label left">
          <span>{leftLabel}</span>
        </div>
        <div className="spectrum-label right">
          <span>{rightLabel}</span>
        </div>
      </div>

      {/* Spectrum Bar */}
      <div className="spectrum-bar" style={{ position: 'relative', marginBottom: 'var(--space-xl)' }}>
        {/* Gradient bar */}
        <div style={{
          height: '60px',
          background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 50%, var(--success) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '3px solid var(--border-color)',
          position: 'relative',
          marginBottom: 'var(--space-md)'
        }}>
          {/* Target marker (only shown when showTarget is true) */}
          {showTarget && target !== null && (
            <div style={{
              position: 'absolute',
              left: `${(target / 20) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '100%',
              background: '#ef4444',
              zIndex: 3,
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ef4444',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                🎯 Target: {target}
              </div>
            </div>
          )}

          {/* Guess marker (shown when guess is provided and we're not in edit mode) */}
          {guess !== null && !onGuessChange && (
            <div style={{
              position: 'absolute',
              left: `${(guess / 20) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '6px',
              height: '110%',
              background: '#f59e0b',
              zIndex: 2,
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#f59e0b',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                📍 Guess: {guess}
              </div>
            </div>
          )}

          {/* Scale markers */}
          <div style={{
            position: 'absolute',
            bottom: '-25px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            {[0, 5, 10, 15, 20].map(num => (
              <span key={num}>{num}</span>
            ))}
          </div>
        </div>

        {/* Interactive slider (only shown when onGuessChange is provided) */}
        {onGuessChange && (
          <div className="mt-lg">
            <input
              type="range"
              min="0"
              max="20"
              value={sliderValue}
              onChange={handleSliderChange}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: 'var(--bg-tertiary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <div className="text-center mt-md">
              <span style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--primary-light)'
              }}>
                Jouw guess: {sliderValue}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Distance info (only shown after both target and guess are revealed) */}
      {showTarget && target !== null && guess !== null && (
        <div className="text-center mt-md">
          <p style={{
            fontSize: '1.1rem',
            color: Math.abs(target - guess) <= 2 ? 'var(--success)' : 'var(--text-secondary)'
          }}>
            Afstand: {Math.abs(target - guess)} {Math.abs(target - guess) <= 2 ? '🎉' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

export default Spectrum;
