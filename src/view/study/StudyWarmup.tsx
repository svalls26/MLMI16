import React, { useEffect, useRef, useState } from "react";
import { useStudyModelStore } from "./StudyModel";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function StudyWarmup(props: { image: string; durationSeconds: number }) {
  const { image, durationSeconds } = props;
  const nextStep = useStudyModelStore((state) => state.nextStep);
  const logEvent = useStudyModelStore((state) => state.logEvent);

  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [timerDone, setTimerDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    logEvent('WARMUP_STARTED', { durationSeconds });
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timerColour = secondsLeft <= 15 ? '#c0392b' : secondsLeft <= 30 ? '#e67e22' : '#27ae60';

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f5', gap: 24,
    }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, maxWidth: 820, width: '90%', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>

        {/* Header */}
        <h2 style={{ margin: '0 0 6px', textAlign: 'center' }}>Think-Aloud Warm-up</h2>
        <p style={{ margin: '0 0 20px', textAlign: 'center', color: '#555', fontSize: 15 }}>
          Please <b>describe this image out loud</b> — say everything you notice, no matter how small.
          Keep talking until the timer ends.
        </p>

        {/* Image */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img
            src={image}
            alt="Warm-up stimulus"
            style={{ maxWidth: '100%', maxHeight: 380, borderRadius: 6, border: '1px solid #ddd', objectFit: 'contain' }}
          />
        </div>

        {/* Timer */}
        <div style={{
          textAlign: 'center', fontWeight: 'bold', fontSize: 36,
          color: timerColour,
          border: `2px solid ${timerColour}`, borderRadius: 8,
          padding: '8px 0', marginBottom: 20,
          transition: 'color 0.3s, border-color 0.3s',
        }}>
          {formatTime(secondsLeft)}
          {timerDone && (
            <div style={{ fontSize: 14, fontWeight: 'normal', color: '#c0392b', marginTop: 4 }}>
              Time is up
            </div>
          )}
        </div>

        {/* Continue button — always visible so experimenter can skip if needed */}
        <div style={{ textAlign: 'right' }}>
          <button
            style={{
              padding: '10px 28px', borderRadius: 5, fontSize: 15,
              fontWeight: 'bold', cursor: 'pointer', border: 'none',
              background: timerDone ? '#27ae60' : '#95a5a6', color: 'white',
            }}
            onClick={() => { logEvent('WARMUP_ENDED', { secondsLeft }); nextStep(); }}
          >
            {timerDone ? 'Continue' : 'Skip (experimenter only)'}
          </button>
        </div>
      </div>
    </div>
  );
}
