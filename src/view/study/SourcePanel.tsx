import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStudyModelStore } from "./StudyModel";
import { StudyTask } from "./StudyTaskGenerator";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SourcePanelProps {
  task: StudyTask;
  /** For the Direct condition: called when participant submits their final summary.
   *  The content to log is passed in from the parent, which reads it from the model. */
  onSubmit?: () => void;
  /** Show the Submit button in this panel (used for the Direct condition). */
  showSubmitButton?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SourcePanel({ task, onSubmit, showSubmitButton }: SourcePanelProps) {
  const stepId = useStudyModelStore((state) => state.stepId);
  const taskId = useStudyModelStore((state) => state.taskId);
  const logTaskStart = useStudyModelStore((state) => state.logTaskStart);
  const logFirstInteraction = useStudyModelStore((state) => state.logFirstInteraction);
  const logEvent = useStudyModelStore((state) => state.logEvent);

  const totalSeconds = task.timeLimitMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [timedOut, setTimedOut] = useState(false);
  const [taskRunning, setTaskRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset and fire TASK_START whenever task/step changes
  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setTimedOut(false);
    setTaskRunning(true);
    logTaskStart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, taskId, totalSeconds]);

  // Soft countdown — stops at zero but does not force task completion
  useEffect(() => {
    if (!taskRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimedOut(true);
          logEvent('TASK_TIME_LIMIT_REACHED', { taskCode: task.taskCode });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskRunning]);

  const handleFirstInteraction = useCallback(() => {
    logFirstInteraction();
  }, [logFirstInteraction]);

  const handleSubmit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTaskRunning(false);
    onSubmit?.();
  }, [onSubmit]);

  // Timer colour: neutral gray until last minute, then a mild amber hint
  const timerColour = secondsLeft <= 60 ? '#b7770d' : '#555';

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8f8f8',
      borderRight: '1px solid #ddd',
    }}>

      {/* ── Header: timer + compact instructions ── */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #ddd',
        background: '#f0f0f0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>Source document</span>
          <span style={{
            fontSize: 13, fontWeight: 500, color: timerColour,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {timedOut ? 'Time elapsed' : formatTime(secondsLeft)}
          </span>
        </div>

        <div style={{
          fontSize: 12, color: '#555', lineHeight: 1.5,
          background: 'white', borderRadius: 4, padding: '8px 10px',
          border: '1px solid #e0e0e0',
        }}>
          Use the interface in whatever way feels most natural to you — copy from the source, ask
          questions, edit the summary, or verify any points you consider important.<br /><br />
          <b>You have up to {task.timeLimitMinutes} minutes, but you may finish whenever you feel
          the summary is accurate and trustworthy enough to share.</b>
        </div>
      </div>

      {/* ── Source document body ── */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          fontSize: 14,
          lineHeight: 1.7,
          color: '#222',
          userSelect: 'text',
          cursor: 'text',
        }}
        onPointerDown={handleFirstInteraction}
      >
        {task.sourceDocument.split('\n\n').map((para, i) => (
          <p key={i} style={{ marginTop: 0, marginBottom: 12 }}>{para}</p>
        ))}
      </div>

      {/* ── Submit button (Direct condition only) ── */}
      {showSubmitButton && (
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid #ddd',
          background: '#f0f0f0',
          flexShrink: 0,
        }}>
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '10px 0',
              background: '#2980b9',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              fontWeight: 'bold',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Submit final summary
          </button>
        </div>
      )}
    </div>
  );
}
