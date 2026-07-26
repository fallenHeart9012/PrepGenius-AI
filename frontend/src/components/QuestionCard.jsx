import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Lightbulb, Send, Loader2, CheckCircle } from 'lucide-react';

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onSubmitAnswer,
  isSubmitting,
  answered
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setUserAnswer(answered?.user_answer || '');
    setShowHint(false);
    setIsSpeaking(false);
    setIsListening(false);
  }, [question, answered]);

  // Text-to-Speech (SpeechSynthesis)
  const toggleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(question.question_text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Speech synthesis is not supported in your browser.');
    }
  };

  // Speech-to-Text (SpeechRecognition)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please type your answer below.');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    if (isSpeaking && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    onSubmitAnswer(question.id, userAnswer);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
      {/* Step Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#FFF',
            fontWeight: 700,
            fontSize: '0.8rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px'
          }}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
            fontSize: '0.8rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            border: '1px solid var(--border-glass)'
          }}>
            {question.category || 'Technical Evaluation'}
          </span>
        </div>

        {/* Read Aloud Button */}
        <button
          type="button"
          onClick={toggleSpeech}
          style={{
            background: isSpeaking ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            color: isSpeaking ? 'var(--accent-rose)' : 'var(--text-muted)',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
        </button>
      </div>

      {/* Question Text */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFF', lineHeight: '1.5', marginBottom: '1.5rem' }}>
        {question.question_text}
      </h2>

      {/* Hints Accordion */}
      {question.hints && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-amber)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: 0
            }}
          >
            <Lightbulb size={16} />
            <span>{showHint ? 'Hide Interviewer Hint' : 'Show Interviewer Hint'}</span>
          </button>
          {showHint && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginTop: '0.6rem',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              lineHeight: '1.5'
            }}>
              <strong>Key Focus Areas:</strong> {question.hints}
            </div>
          )}
        </div>
      )}

      {/* Response Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="form-label">Your Response:</label>
          <button
            type="button"
            onClick={toggleListening}
            style={{
              background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              color: isListening ? 'var(--accent-rose)' : 'var(--accent-emerald)',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            <span>{isListening ? 'Stop Voice Recording' : 'Dictate Answer (Mic)'}</span>
          </button>
        </div>

        <textarea
          className="form-textarea"
          rows={6}
          placeholder="Explain your approach, architectural decisions, edge cases, and code structure clearly..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isSubmitting || !!answered}
          style={{ width: '100%', marginBottom: '1.25rem' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {answered ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              <CheckCircle size={18} />
              <span>Answer Submitted & Evaluated by AI</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Tip: Provide clear reasoning and trade-offs for full marks.
            </span>
          )}

          {!answered && (
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !userAnswer.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="pulse-glow" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Evaluating with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
