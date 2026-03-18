import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatInterface from "../ChatInterface";
import DirectInterface from "../DirectInterface";
import TextualEntity from "../entities/TextualEntity";
import { useModelStore } from "../../model/Model";
import { recordingService } from "../../services/RecordingService";
import CognitiveEffortQuestionnaire from "./CognitiveEffortQuestionnaire";
import ComprehensionQuiz from "./ComprehensionQuiz";
import SourcePanel from "./SourcePanel";
import StudyMessage from "./StudyMessage";
import { useStudyModelStore } from "./StudyModel";
import { StudyCondition, StudyStep, StudyTaskGenerator } from "./StudyTaskGenerator";
import StudyTour from "./StudyTour";
import StudyVideo from "./StudyVideo";
import StudyWarmup from "./StudyWarmup";

const IDLE_THRESHOLD_MS = 30_000; // 30 seconds

// ─── Copy-paste modal ─────────────────────────────────────────────────────────

interface SubmitModalProps {
  content: string;
  phase: 'first-pass' | 'second-pass';
  timedOut: boolean;
  onEditFurther: () => void;
  onFinish: () => void;
}

function SubmitModal({ content, phase, timedOut, onEditFurther, onFinish }: SubmitModalProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        width: 600,
        maxWidth: '90vw',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #eee',
          background: timedOut ? '#fff8f0' : '#fff',
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#222', marginBottom: 4 }}>
            {timedOut ? 'Time is up' : 'Your final summary'}
          </div>
          <div style={{ fontSize: 13, color: timedOut ? '#b7580d' : '#666' }}>
            {timedOut
              ? 'Your time has elapsed. Your current summary has been submitted automatically — you cannot go back to editing.'
              : 'Review your summary below. You can copy it, or go back to keep editing.'}
          </div>
        </div>

        {/* Summary text */}
        <textarea
          readOnly
          value={content || '(No summary generated yet — please interact with the interface first.)'}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            padding: '14px 20px',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#222',
            background: '#fffef5',
            fontFamily: 'inherit',
            minHeight: 220,
            overflowY: 'auto',
          }}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />

        {/* Action buttons */}
        <div style={{
          padding: '12px 20px 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}>
          {!timedOut && (
            <button
              onClick={onEditFurther}
              style={{
                padding: '8px 18px',
                background: '#fff',
                color: '#2980b9',
                border: '1.5px solid #2980b9',
                borderRadius: 5,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Edit further
            </button>
          )}
          <button
            onClick={onFinish}
            style={{
              padding: '8px 18px',
              background: '#27ae60',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {timedOut ? 'Continue to questions' : 'Done — finish task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudyInterface() {
  let participantId = useStudyModelStore((state) => state.participantId);
  let steps = useStudyModelStore((state) => state.steps);
  let stepId = useStudyModelStore((state) => state.stepId);
  const phase = useStudyModelStore((state) => state.phase);

  const setParticipantId = useStudyModelStore((state) => state.setParticipantId);
  const setSteps = useStudyModelStore((state) => state.setSteps);
  const setStepId = useStudyModelStore((state) => state.setStepId);
  const nextStep = useStudyModelStore((state) => state.nextStep);
  const logEvent = useStudyModelStore((state) => state.logEvent);
  const setIsDataSaved = useStudyModelStore((state) => state.setIsDataSaved);
  const isDataSaved = useStudyModelStore((state) => state.isDataSaved);
  const downloadZip = useStudyModelStore((state) => state.downloadSessionZip);
  const submitForReview = useStudyModelStore((state) => state.submitForReview);
  const chooseEditFurther = useStudyModelStore((state) => state.chooseEditFurther);
  const finishTask = useStudyModelStore((state) => state.finishTask);

  // ── Local modal / quiz state ──────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizContent, setQuizContent] = useState('');

  // ── Tour state — shown only for the first task of each interface type
  const [tourComplete, setTourComplete] = useState(false);
  const tourShownRef = useRef<{ direct: boolean; chat: boolean }>({ direct: false, chat: false });
  const tourStepRef = useRef(-1);
  useEffect(() => {
    const step = steps[stepId];
    if (step?.type === 'condition' && tourStepRef.current !== stepId) {
      tourStepRef.current = stepId;
      const iface = step.isDirect ? 'direct' : 'chat';
      // Skip tour if this interface type has already been introduced
      setTourComplete(tourShownRef.current[iface]);
    }
  }, [stepId, steps]);

  // ── Previous step ref (recording lifecycle) ───────────────────────────────
  const prevStepRef = useRef<StudyStep | null>(null);

  // ── Idle detection ────────────────────────────────────────────────────────
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(false);

  const resetIdleTimer = useCallback(() => {
    if (isIdleRef.current) {
      logEvent('IDLE_END', {});
      isIdleRef.current = false;
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      logEvent('IDLE_START', {});
    }, IDLE_THRESHOLD_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logEvent]);

  useEffect(() => {
    const events = ['pointermove', 'keydown', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // ── URL bootstrapping ────────────────────────────────────────────────────
  const hashSplitted = window.location.hash.split("?");
  const search = hashSplitted[hashSplitted.length - 1];
  const params = new URLSearchParams(search);
  const pid = params.get('pid');
  const pstepId = params.get('stepId');
  const dataSaved = params.get('dataSaved');
  const launchedFromLauncher = dataSaved === "true";

  // ── Acquire recording streams once after consent ──────────────────────────
  const streamsAcquiredRef = useRef(false);
  useEffect(() => {
    if (isDataSaved && !streamsAcquiredRef.current) {
      streamsAcquiredRef.current = true;
      recordingService.acquireStreams().then(({ audioOk, screenOk }) => {
        logEvent('STREAMS_ACQUIRED', { audioOk, screenOk });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataSaved]);

  // ── Recording lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    const currentStep = steps[stepId];
    const prevStep = prevStepRef.current;

    if (!isDataSaved) {
      prevStepRef.current = currentStep ?? null;
      return;
    }

    if (prevStep?.type === 'condition' && currentStep?.type !== 'condition') {
      recordingService.stopBlock().then(() => {
        logEvent('RECORDING_STOPPED', { stepId: prevStep });
      });
      useStudyModelStore.getState().saveData(true);
    }

    if (currentStep?.type === 'condition' && prevStep?.type !== 'condition') {
      const blockLabel = `P${participantId}_block${stepId}`;
      const { audioOk, screenOk } = recordingService.startBlock(blockLabel);
      logEvent('RECORDING_STARTED', { blockLabel, audioOk, screenOk });
    }

    prevStepRef.current = currentStep ?? null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  // ── Submit handler: grab current summary from model → open modal ──────────
  const handleSubmitClick = useCallback(() => {
    const content = useModelStore.getState().getLastGptMessage().content;
    submitForReview(content);
    setModalContent(content);
    setIsTimedOut(false);
    setShowModal(true);
  }, [submitForReview]);

  // ── Auto-submit when timer expires ────────────────────────────────────────
  const handleTimedOut = useCallback(() => {
    const content = useModelStore.getState().getLastGptMessage().content;
    submitForReview(content);
    setModalContent(content);
    setIsTimedOut(true);
    setShowModal(true);
  }, [submitForReview]);

  // ── Modal callbacks ───────────────────────────────────────────────────────
  const handleModalEditFurther = useCallback(() => {
    chooseEditFurther();
    setShowModal(false);
  }, [chooseEditFurther]);

  const handleModalFinish = useCallback(() => {
    setShowModal(false);
    setQuizContent(modalContent);
    setShowQuiz(true);
  }, [modalContent]);

  // ── Quiz completion: record answers then advance task ─────────────────────
  const handleQuizComplete = useCallback(() => {
    setShowQuiz(false);
    setIsTimedOut(false);
    finishTask(quizContent);
  }, [finishTask, quizContent]);

  // ──────────────────────────────────────────────────────────────────────────

  if (!launchedFromLauncher) {
    window.location.hash = '/';
    return null;
  }

  setIsDataSaved(true);
  if (participantId === -1 && pid) {
    setParticipantId(participantId = parseInt(pid));
    setSteps(StudyTaskGenerator.generateSteps(participantId));
    if (pstepId) {
      setStepId(stepId = parseInt(pstepId));
    } else {
      nextStep();
    }
  }

  if (participantId < 0) {
    return <StudyMessage message="Error: Make sure the URL is correct." />;
  }

  let currentStep: StudyStep | null = null;
  if (stepId < steps.length) {
    currentStep = steps[stepId];
  }

  const isLastStep = stepId === steps.length - 1;

  if (currentStep) {
    if (currentStep.type === 'message') {
      return (
        <StudyMessage
          message={currentStep.message || ""}
          showDownloadButton={isLastStep && isDataSaved}
          onDownload={downloadZip}
        />
      );

    } else if (currentStep.type === 'warmup') {
      return <StudyWarmup
        image={currentStep.warmupImage || ''}
        durationSeconds={currentStep.warmupDurationSeconds || 90}
      />;

    } else if (currentStep.type === 'video') {
      return <StudyVideo video={currentStep.video || ""} />;

    } else if (currentStep.type === 'questionnaire') {
      const order = currentStep.questionnaireInterfaceOrder || ['direct', 'chat'];
      return <CognitiveEffortQuestionnaire interfaceOrder={order} />;

    } else if (currentStep.type === 'condition') {
      const condition = currentStep.condition as StudyCondition;
      const currentTask = condition.task;

      // ── Comprehension quiz replaces the task UI entirely ─────────────────
      if (showQuiz) {
        return (
          <ComprehensionQuiz
            taskCode={currentTask.taskCode}
            questions={currentTask.comprehensionQuestions}
            onComplete={handleQuizComplete}
          />
        );
      }

      // Right panel: Direct (TextualEntity is the summary) or Chat (last message is the summary)
      const rightInterface = currentStep.isDirect
        ? <DirectInterface><TextualEntity /></DirectInterface>
        : <ChatInterface />;

      const handleInterfaceFocus = () => logEvent('PANEL_FOCUS', { panel: 'interface' });

      return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

          {/* Left column — source document (full height) + submit button */}
          <div style={{
            width: '38%', minWidth: 320, maxWidth: 520,
            flexShrink: 0, height: '100%',
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid #ccc',
          }}>
            <SourcePanel
              task={currentTask}
              onSubmit={handleSubmitClick}
              onTimedOut={handleTimedOut}
              timerActive={tourComplete}
            />
          </div>

          {/* Right column — yellow reminder banner + LLM interface */}
          <div
            style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onPointerEnter={handleInterfaceFocus}
          >
            {/* ── Yellow instruction banner above the AI summary ── */}
            <div style={{
              padding: '7px 18px',
              background: '#fef9e7',
              borderBottom: '1px solid #e8dfa0',
              fontSize: 12.5,
              color: '#7a6400',
              flexShrink: 0,
            }}>
              {currentStep.isDirect
                ? <>This panel shows the AI-generated summary — the current state of the document as modified through your prompts. Edit it using the prompt bar below. When ready, click <b>Submit final summary</b>: this opens a review panel showing the current document content for a final check before finishing. You have up to {currentTask.timeLimitMinutes} min.</>
                : <>This panel shows the AI-generated summary. Send prompts below to refine it. When ready, click <b>Submit final summary</b>. You have up to {currentTask.timeLimitMinutes} min.</>
              }
            </div>

            {/* ── Interface fills remaining height ── */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {rightInterface}
            </div>
          </div>

          {/* Tour overlay — shown until participant clicks through all steps */}
          {!tourComplete && (
            <StudyTour
              isDirect={!!currentStep.isDirect}
              onComplete={() => {
                const iface = currentStep.isDirect ? 'direct' : 'chat';
                tourShownRef.current[iface] = true;
                setTourComplete(true);
              }}
            />
          )}

          {/* Submit modal */}
          {showModal && (
            <SubmitModal
              content={modalContent}
              phase={phase}
              timedOut={isTimedOut}
              onEditFurther={handleModalEditFurther}
              onFinish={handleModalFinish}
            />
          )}

        </div>
      );
    }
  }

  return <StudyMessage message="Study is loading..." />;
}
