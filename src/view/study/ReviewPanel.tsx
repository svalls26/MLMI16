import React from "react";
import { StudyTask } from "./StudyTaskGenerator";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReviewPanelProps {
  task: StudyTask;
  submittedSummary: string;
  onEditFurther: () => void;
  onSatisfied: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewPanel({ task, submittedSummary, onEditFurther, onSatisfied }: ReviewPanelProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', flexDirection: 'column', background: '#fff' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid #ddd',
        background: '#f7f7f7',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#222', marginBottom: 4 }}>
          Review your summary
        </div>
        <div style={{ fontSize: 13, color: '#555' }}>
          Before we finish, take a moment to review your final version. Is there anything you'd like to change?
        </div>
      </div>

      {/* ── Side-by-side panels ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: source document */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #ddd',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 16px',
            background: '#f0f0f0',
            borderBottom: '1px solid #ddd',
            fontSize: 12,
            fontWeight: 600,
            color: '#555',
            flexShrink: 0,
          }}>
            Source document — Task {task.taskCode}
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#222',
            userSelect: 'text',
          }}>
            {task.sourceDocument.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginTop: 0, marginBottom: 12 }}>{para}</p>
            ))}
          </div>
        </div>

        {/* Right: submitted summary */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#fffef5',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 16px',
            background: '#faf7e8',
            borderBottom: '1px solid #ddd',
            fontSize: 12,
            fontWeight: 600,
            color: '#555',
            flexShrink: 0,
          }}>
            Your submitted summary
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#222',
            userSelect: 'text',
            whiteSpace: 'pre-wrap',
          }}>
            {submittedSummary}
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #ddd',
        background: '#f7f7f7',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={onEditFurther}
          style={{
            padding: '8px 20px',
            background: '#fff',
            color: '#2980b9',
            border: '1.5px solid #2980b9',
            borderRadius: 5,
            fontWeight: 'bold',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Edit further
        </button>
        <button
          onClick={onSatisfied}
          style={{
            padding: '8px 20px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            fontWeight: 'bold',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          I'm satisfied — finish
        </button>
      </div>
    </div>
  );
}
