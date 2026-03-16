import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStudyModelStore } from "./StudyModel";
import { StudyTask } from "./StudyTaskGenerator";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DraftPanelProps {
  task: StudyTask;
  /** Called when participant clicks "Submit final summary". */
  onSubmit: (finalContent: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DraftPanel({ task, onSubmit }: DraftPanelProps) {
  const stepId = useStudyModelStore((state) => state.stepId);
  const taskId = useStudyModelStore((state) => state.taskId);
  const logDraftEdit = useStudyModelStore((state) => state.logDraftEdit);
  const logFirstInteraction = useStudyModelStore((state) => state.logFirstInteraction);

  const [draft, setDraft] = useState(task.hallucinatedSummary);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset draft whenever task changes
  useEffect(() => {
    setDraft(task.hallucinatedSummary);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, taskId]);

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

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fffef5',
      borderLeft: '1px solid #ddd',
    }}>

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
          <span style={{
            marginLeft: 8,
            fontSize: 11,
            color: '#888',
            fontStyle: 'italic',
          }}>
            — edit directly or use the chat to refine it
          </span>
        </div>
        <button
          onClick={handleSubmit}
          style={{
            padding: '6px 14px',
            background: '#2980b9',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            fontWeight: 'bold',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Submit final summary
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
