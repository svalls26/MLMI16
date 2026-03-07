import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStudyModelStore } from "./StudyModel";
import { StudyTask } from "./StudyTaskGenerator";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'task' | 'count' | 'comprehension' | 'done';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Full-screen page for post-task questions ───────────────────────────────
// Renders as a fixed overlay with a solid white background so participants
// cannot reference the source document or summary while answering.

function QuizPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'white', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 560, width: '90%', maxHeight: '90vh', overflowY: 'auto',
        padding: 32,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TaskPanel(props: { task: StudyTask }) {
  const { task } = props;
  const nextStep = useStudyModelStore((state) => state.nextStep);
  const stepId = useStudyModelStore((state) => state.stepId);
  const taskId = useStudyModelStore((state) => state.taskId);
  const logEvent = useStudyModelStore((state) => state.logEvent);
  const logTaskStart = useStudyModelStore((state) => state.logTaskStart);
  const logTaskEnd = useStudyModelStore((state) => state.logTaskEnd);
  const logFirstInteraction = useStudyModelStore((state) => state.logFirstInteraction);
  const addQuizResult = useStudyModelStore((state) => state.addQuizResult);

  const totalSeconds = task.timeLimitMinutes * 60;

  const [phase, setPhase] = useState<Phase>('task');
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [timedOut, setTimedOut] = useState(false);

  // Hallucination count state
  const [hallucinationCount, setHallucinationCount] = useState<string>('');

  // Comprehension state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [comprehensionAnswers, setComprehensionAnswers] = useState<{ questionIndex: number; question: string; selectedOption: number; correctIndex: number; isCorrect: boolean }[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when task/step changes and fire TASK_START
  useEffect(() => {
    setPhase('task');
    setSecondsLeft(task.timeLimitMinutes * 60);
    setTimedOut(false);
    setHallucinationCount('');
    setQuestionIndex(0);
    setSelectedOption(null);
    setComprehensionAnswers([]);
    logTaskStart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, taskId, task.timeLimitMinutes]);

  // Countdown timer — only runs during 'task' phase
  useEffect(() => {
    if (phase !== 'task') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimedOut(true);
          setPhase('count');
          logEvent('TASK_TIMED_OUT', { taskId });
          logTaskEnd(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, taskId, logEvent, logTaskEnd]);

  // Log the first interaction inside the task (proxy for starting to engage)
  // Exposed via onPointerDown on the source document area so any click/touch counts
  const handleFirstInteraction = useCallback(() => {
    logFirstInteraction();
  }, [logFirstInteraction]);

  const handleDone = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    logEvent('USER_CLICKED_DONE', { secondsLeft, timedOut });
    logTaskEnd(false);
    setPhase('count');
  }, [secondsLeft, timedOut, logEvent, logTaskEnd]);

  const handleCountSubmit = useCallback(() => {
    const count = parseInt(hallucinationCount, 10);
    logEvent('HALLUCINATION_COUNT_SUBMITTED', { count, expected: task.expectedHallucinations });
    setSelectedOption(null);
    setPhase('comprehension');
  }, [hallucinationCount, task.expectedHallucinations, logEvent]);

  const handleComprehensionAnswer = useCallback(() => {
    if (selectedOption === null) return;

    const q = task.comprehensionQuestions[questionIndex];
    const answerRecord = {
      questionIndex,
      question: q.question,
      selectedOption,
      correctIndex: q.correctIndex,
      isCorrect: selectedOption === q.correctIndex,
    };
    const updated = [...comprehensionAnswers, answerRecord];

    logEvent('COMPREHENSION_ANSWERED', {
      questionIndex,
      question: q.question,
      selected: selectedOption,
      correct: q.correctIndex,
    });
    setComprehensionAnswers(updated);
    setSelectedOption(null);

    if (questionIndex + 1 < task.comprehensionQuestions.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      logEvent('COMPREHENSION_COMPLETE', { answers: updated });

      // Persist structured quiz result to the store for ZIP export
      addQuizResult({
        hallucinationSelfReport: parseInt(hallucinationCount, 10),
        expectedHallucinations: task.expectedHallucinations,
        comprehensionAnswers: updated,
      });

      nextStep();
    }
  }, [selectedOption, comprehensionAnswers, questionIndex, task, hallucinationCount, logEvent, addQuizResult, nextStep]);

  // Timer colour: green → orange (last minute) → red (last 30 s)
  const timerColour = secondsLeft <= 30 ? '#c0392b' : secondsLeft <= 60 ? '#e67e22' : '#27ae60';
  const timerWarning = secondsLeft <= 60 && phase === 'task';

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{
      background: 'rgb(220,220,220)', userSelect: 'none', height: '100%',
      minWidth: 260, maxWidth: 380, padding: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>

      {/* Timer */}
      <div style={{
        textAlign: 'center', fontWeight: 'bold',
        fontSize: 28, color: timerColour,
        border: `2px solid ${timerColour}`, borderRadius: 6, padding: '4px 0',
        background: timerWarning ? 'rgba(231,76,60,0.08)' : 'transparent',
      }}>
        {formatTime(secondsLeft)}
        {timedOut && <span style={{ fontSize: 13, fontWeight: 'normal', display: 'block', color: '#c0392b' }}>Time is up</span>}
      </div>

      {/* Instructions */}
      <div style={{ background: 'white', borderRadius: 5, padding: 10, fontSize: 13, lineHeight: 1.5 }}>
        <b>Task instructions</b><br />
        There are hallucinations in the summary on the right. Your task is to find and correct them. You will be asked how many you found when the timer ends.<br /><br />
        Use the interface on the right to correct the summary. Think aloud as you work.
      </div>

      {/* Source document — onPointerDown captures the first interaction */}
      <div
        style={{
          flexGrow: 1, background: 'white', borderRadius: 5, padding: 10,
          overflowY: 'auto', fontSize: 18, lineHeight: 1.6,
        }}
        onPointerDown={handleFirstInteraction}
      >
        <b style={{ display: 'block', marginBottom: 6 }}>Source document</b>
        {task.sourceDocument.split('\n\n').map((para, i) => (
          <p key={i} style={{ marginTop: 0, marginBottom: 8 }}>{para}</p>
        ))}
      </div>

      {/* Done button */}
      {phase === 'task' && (
        <button
          style={{
            padding: '10px 0', borderRadius: 5, fontWeight: 'bold', cursor: 'pointer',
            background: timedOut ? '#c0392b' : '#2980b9', color: 'white', border: 'none',
          }}
          onClick={handleDone}
        >
          {timedOut ? 'Times up — click to continue' : 'Done'}
        </button>
      )}

      {/* ── Hallucination count overlay ── */}
      {phase === 'count' && (
        <QuizPage>
          <h3 style={{ marginTop: 0 }}>How many hallucinations did you find?</h3>
          <p style={{ color: '#555', fontSize: 14 }}>
            Enter the number of hallucinations you identified in the summary (not necessarily corrected).
          </p>
          <input
            type="number"
            min={0}
            max={20}
            value={hallucinationCount}
            onChange={(e) => setHallucinationCount(e.target.value)}
            style={{ fontSize: 20, width: 80, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
            autoFocus
          />
          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <button
              disabled={hallucinationCount === '' || isNaN(parseInt(hallucinationCount, 10))}
              style={{
                padding: '10px 24px', background: '#2980b9', color: 'white',
                border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold',
              }}
              onClick={handleCountSubmit}
            >
              Next
            </button>
          </div>
        </QuizPage>
      )}

      {/* ── Comprehension questions (full-screen page) ── */}
      {phase === 'comprehension' && task.comprehensionQuestions.length > 0 && (
        <QuizPage>
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 6px' }}>
            Comprehension question {questionIndex + 1} of {task.comprehensionQuestions.length}
          </p>
          <h3 style={{ marginTop: 0, lineHeight: 1.4 }}>
            {task.comprehensionQuestions[questionIndex].question}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {task.comprehensionQuestions[questionIndex].options.map((opt, i) => (
              <label key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 5, cursor: 'pointer',
                background: selectedOption === i ? '#d6eaf8' : '#f5f5f5',
                border: `1px solid ${selectedOption === i ? '#2980b9' : '#ddd'}`,
              }}>
                <input
                  type="radio"
                  name="comprehension"
                  checked={selectedOption === i}
                  onChange={() => setSelectedOption(i)}
                />
                {opt}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <button
              disabled={selectedOption === null}
              style={{
                padding: '10px 24px', background: '#2980b9', color: 'white',
                border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold',
              }}
              onClick={handleComprehensionAnswer}
            >
              {questionIndex + 1 < task.comprehensionQuestions.length ? 'Next question' : 'Submit'}
            </button>
          </div>
        </QuizPage>
      )}
    </div>
  );
}
