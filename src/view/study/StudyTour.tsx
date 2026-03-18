import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourStep {
  title: string;
  body: string;
  /** Fixed-position highlight rect (CSS values) */
  highlight: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
  /** Where to anchor the tooltip card */
  tooltip: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
    transform?: string;
  };
}

// ─── Step definitions ─────────────────────────────────────────────────────────

function buildSteps(isDirect: boolean): TourStep[] {
  return [
    {
      title: 'Source document',
      body:
        'This panel contains the source text for this task. ' +
        'Use it to verify that the AI-generated summary on the right is accurate and complete.',
      highlight: { left: '0', top: '0', width: '38%', height: '100%' },
      tooltip: { left: '40%', top: '50%', transform: 'translateY(-50%)' },
    },
    {
      title: isDirect ? 'DirectGPT — AI-generated summary' : 'ChatGPT — AI-generated summary',
      body: isDirect
        ? 'The AI has already drafted a summary for you. ' +
          'Select any text in it and type a prompt below to ask the model to correct, rewrite, or expand that part.'
        : 'The AI has already drafted a summary for you. ' +
          'Use the chat as you would normally do.',
      highlight: { left: '38%', top: '0', width: '62%', height: '100%' },
      tooltip: { left: '39%', top: '50%', transform: 'translateY(-50%)' },
    },
    ...(isDirect ? [{
      title: 'Undo & Redo',
      body:
        'The toolbar at the top of the document lets you step backwards and forwards through every change made by the model. ' +
        'Use Undo if you want to revert a prompt result, and Redo to reapply it.',
      highlight: { left: '38%', top: '0', width: '62%', height: '44px' },
      tooltip: { left: '39%', top: '56px' },
    }] : []),
    {
      title: 'Submit final summary',
      body:
        'When you are satisfied with the accuracy and quality of the summary, click this button. ' +
        (isDirect
          ? 'You will see the final version and can still go back to edit further before finishing. '
          : 'The summary saved will be the last message in the chat. You can still go back to edit further before finishing. ') +
        'The timer starts now.',
      highlight: { left: '0', top: 'calc(100% - 58px)', width: '38%', height: '58px' },
      tooltip: { left: '40%', bottom: '70px' },
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StudyTourProps {
  isDirect: boolean;
  onComplete: () => void;
}

export default function StudyTour({ isDirect, onComplete }: StudyTourProps) {
  const steps = buildSteps(isDirect);
  const [idx, setIdx] = useState(0);

  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setIdx(idx + 1);
    }
  };

  return (
    <>
      {/* Spotlight — transparent box that casts a shadow over everything else */}
      <div
        style={{
          position: 'fixed',
          left: step.highlight.left,
          top: step.highlight.top,
          width: step.highlight.width,
          height: step.highlight.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.52)',
          border: '2px solid rgba(74, 144, 217, 0.85)',
          borderRadius: 3,
          zIndex: 9000,
          pointerEvents: 'none',
        }}
      />

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          zIndex: 9001,
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 8px 36px rgba(0,0,0,0.28)',
          padding: '22px 24px 18px',
          maxWidth: 340,
          width: 'calc(min(340px, 56%))',
          ...step.tooltip,
        }}
      >
        {/* Step counter dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === idx ? '#2980b9' : '#d0d0d0',
              }}
            />
          ))}
        </div>

        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 8 }}>
          {step.title}
        </div>
        <div style={{ fontSize: 13.5, color: '#444', lineHeight: 1.65, marginBottom: 18 }}>
          {step.body}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleNext}
            style={{
              padding: '8px 22px',
              background: isLast ? '#27ae60' : '#2980b9',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            {isLast ? 'Start task' : 'Next →'}
          </button>
        </div>
      </div>
    </>
  );
}
