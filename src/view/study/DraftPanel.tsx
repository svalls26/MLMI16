import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStudyModelStore } from "./StudyModel";
import { StudyTask } from "./StudyTaskGenerator";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DraftPanelProps {
  task: StudyTask;
  /** Called when participant clicks the submit/finish button. */
  onSubmit: (finalContent: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DraftPanel({ task, onSubmit }: DraftPanelProps) {
  const stepId = useStudyModelStore((state) => state.stepId);
  const taskId = useStudyModelStore((state) => state.taskId);
  const phase = useStudyModelStore((state) => state.phase);
  const firstPassSummary = useStudyModelStore((state) => state.firstPassSummary);
  const logDraftEdit = useStudyModelStore((state) => state.logDraftEdit);
  const logFirstInteraction = useStudyModelStore((state) => state.logFirstInteraction);
  const logEvent = useStudyModelStore((state) => state.logEvent);

  const initialContent = phase === 'second-pass' && firstPassSummary !== null
    ? firstPassSummary
    : task.hallucinatedSummary;

  const [draft, setDraft] = useState(initialContent);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset draft whenever task or phase changes
  useEffect(() => {
    const content = phase === 'second-pass' && firstPassSummary !== null
      ? firstPassSummary
      : task.hallucinatedSummary;
    setDraft(content);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, taskId, phase]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    logFirstInteraction();

    // Debounce draft-edit logging to avoid flooding the event log
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      logDraftEdit(value);
    }, 1500);
  }, [logDraftEdit, logFirstInteraction]);

  const handleSubmit = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSubmit(draft);
  }, [draft, onSubmit]);

  const handlePointerDown = useCallback(() => {
    logFirstInteraction();
  }, [logFirstInteraction]);

  const handlePanelFocus = useCallback(() => {
    logEvent('PANEL_FOCUS', { panel: 'draft' });
  }, [logEvent]);

  const isSecondPass = phase === 'second-pass';
  const buttonLabel = isSecondPass ? "I'm satisfied — finish" : "Submit final summary";

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fffef5',
        borderLeft: '1px solid #ddd',
      }}
      onPointerEnter={handlePanelFocus}
    >

      {/* ── Header ── */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #ddd',
        background: '#faf7e8',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>Draft summary</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: '#999', fontStyle: 'italic' }}>
            AI-generated draft
          </span>
        </div>
        <button
          onClick={handleSubmit}
          style={{
            padding: '6px 14px',
            background: isSecondPass ? '#27ae60' : '#2980b9',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            fontWeight: 'bold',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {buttonLabel}
        </button>
      </div>

      {/* ── Editable draft textarea ── */}
      <textarea
        value={draft}
        onChange={handleChange}
        onPointerDown={handlePointerDown}
        spellCheck={false}
        style={{
          flexGrow: 1,
          resize: 'none',
          border: 'none',
          outline: 'none',
          padding: '12px 14px',
          fontSize: 14,
          lineHeight: 1.7,
          color: '#222',
          background: 'transparent',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}
