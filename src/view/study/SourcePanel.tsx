import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStudyModelStore } from "./StudyModel";
import { StudyTask } from "./StudyTaskGenerator";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SourcePanel({ task }: { task: StudyTask }) {
  const stepId = useStudyModelStore((state) => state.stepId);
  const taskId = useStudyModelStore((state) => state.taskId);
  const logTaskStart = useStudyModelStore((state) => state.logTaskStart);
  const logFirstInteraction = useStudyModelStore((state) => state.logFirstInteraction);
  const logEvent = useStudyModelStore((state) => state.logEvent);

  const totalSeconds = task.timeLimitMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset and fire TASK_START whenever task/step changes
  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setTimedOut(false);
    logTaskStart();
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
  }, [stepId, taskId, totalSeconds]);

  const handleFirstInteraction = useCallback(() => {
    logFirstInteraction();
  }, [logFirstInteraction]);

  const timerColour = secondsLeft <= 60 ? '#b7770d' : '#555';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f8f8f8' }}>

      {/* ── Header: label + timer ── */}
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid #ddd',
        background: '#f0f0f0',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>Source document</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: timerColour, fontVariantNumeric: 'tabular-nums' }}>
          {timedOut ? 'Time elapsed' : formatTime(secondsLeft)}
        </span>
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
    </div>
  );
}
