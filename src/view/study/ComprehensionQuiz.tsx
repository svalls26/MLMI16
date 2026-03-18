import React, { useState } from 'react';
import { ComprehensionQuestion } from './StudyTaskGenerator';
import { useStudyModelStore } from './StudyModel';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ComprehensionQuizProps {
  taskCode: string;
  questions: ComprehensionQuestion[];
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComprehensionQuiz({ taskCode, questions, onComplete }: ComprehensionQuizProps) {
  const addQuizResult = useStudyModelStore((state) => state.addQuizResult);

  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [selfReport, setSelfReport] = useState<number | null>(null);

  const allAnswered = answers.every((a) => a !== null) && selfReport !== null;

  const handleSelect = (questionIdx: number, optionIdx: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIdx] = optionIdx;
      return updated;
    });
  };

  const handleSubmit = () => {
    const comprehensionAnswers = questions.map((q, i) => ({
      questionIndex: i,
      question: q.question,
      selectedOption: answers[i] as number,
      correctIndex: q.correctIndex,
      isCorrect: answers[i] === q.correctIndex,
    }));

    addQuizResult({
      hallucinationSelfReport: selfReport as number,
      expectedHallucinations: 6,
      comprehensionAnswers,
    });

    onComplete();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      overflowY: 'auto',
      padding: '32px 16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        width: 640,
        maxWidth: '100%',
        padding: '28px 32px',
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: '#222', marginBottom: 6 }}>
            Comprehension check — Task {taskCode}
          </div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
            Before continuing, please answer the questions below about what you read.
            Use your memory — do not refer back to the source.
          </div>
        </div>

        {/* ── Hallucination self-report ── */}
        <div style={{
          background: '#f7f7f7',
          borderRadius: 6,
          padding: '14px 16px',
          marginBottom: 22,
        }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#333', marginBottom: 10 }}>
            How many factual inaccuracies do you think were present in the initial AI-generated draft?
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['None', '1', '2', '3', '4', '5', '6 or more'] as const).map((label, i) => {
              const value = i; // 0 = None, 1–5, 6 = "6 or more"
              const selected = selfReport === value;
              return (
                <button
                  key={label}
                  onClick={() => setSelfReport(value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 5,
                    border: selected ? '2px solid #2980b9' : '1.5px solid #ccc',
                    background: selected ? '#eaf4fc' : '#fff',
                    color: selected ? '#1a5f8a' : '#333',
                    fontWeight: selected ? 700 : 400,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Comprehension questions ── */}
        {questions.map((q, qi) => (
          <div key={qi} style={{ marginBottom: 22 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#333', marginBottom: 10 }}>
              {qi + 1}. {q.question}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <label
                    key={oi}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 5,
                      border: selected ? '2px solid #2980b9' : '1.5px solid #ddd',
                      background: selected ? '#eaf4fc' : '#fafafa',
                      cursor: 'pointer',
                      fontSize: 13.5,
                      color: '#222',
                      lineHeight: 1.45,
                    }}
                  >
                    <input
                      type="radio"
                      name={`q${qi}`}
                      checked={selected}
                      onChange={() => handleSelect(qi, oi)}
                      style={{ marginTop: 2, flexShrink: 0, accentColor: '#2980b9' }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Submit ── */}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            disabled={!allAnswered}
            onClick={handleSubmit}
            style={{
              padding: '10px 28px',
              background: allAnswered ? '#27ae60' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 14,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
            }}
          >
            Submit and continue
          </button>
        </div>

        {!allAnswered && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#999', textAlign: 'right' }}>
            Please answer all questions to continue.
          </div>
        )}
      </div>
    </div>
  );
}
