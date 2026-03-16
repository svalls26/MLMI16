import React, { useCallback, useEffect, useRef } from "react";
import ChatInterface from "../ChatInterface";
import DirectInterface from "../DirectInterface";
import TextualEntity from "../entities/TextualEntity";
import { recordingService } from "../../services/RecordingService";
import CognitiveEffortQuestionnaire from "./CognitiveEffortQuestionnaire";
import DraftPanel from "./DraftPanel";
import SourcePanel from "./SourcePanel";
import StudyMessage from "./StudyMessage";
import { useStudyModelStore } from "./StudyModel";
import { StudyCondition, StudyStep, StudyTaskGenerator } from "./StudyTaskGenerator";
import StudyVideo from "./StudyVideo";
import StudyWarmup from "./StudyWarmup";

export default function StudyInterface() {
  let participantId = useStudyModelStore((state) => state.participantId);
  let steps = useStudyModelStore((state) => state.steps);
  let stepId = useStudyModelStore((state) => state.stepId);
  const taskId = useStudyModelStore((state) => state.taskId);

  const setParticipantId = useStudyModelStore((state) => state.setParticipantId);
  const setSteps = useStudyModelStore((state) => state.setSteps);
  const setStepId = useStudyModelStore((state) => state.setStepId);
  const nextStep = useStudyModelStore((state) => state.nextStep);
  const getTaskCode = useStudyModelStore((state) => state.getTaskCode);
  const startFresh = useStudyModelStore((state) => state.startFresh);
  const logEvent = useStudyModelStore((state) => state.logEvent);
  const logTaskEnd = useStudyModelStore((state) => state.logTaskEnd);
  const logFinalSummarySubmitted = useStudyModelStore((state) => state.logFinalSummarySubmitted);
  const setIsDataSaved = useStudyModelStore((state) => state.setIsDataSaved);
  const isDataSaved = useStudyModelStore((state) => state.isDataSaved);
  const downloadZip = useStudyModelStore((state) => state.downloadSessionZip);

  // Track the previous step to detect condition → non-condition transitions
  const prevStepRef = useRef<StudyStep | null>(null);

  // Use URL parameters to bootstrap the session
  const hashSplitted = window.location.hash.split("?");
  const search = hashSplitted[hashSplitted.length - 1];
  const params = new URLSearchParams(search);
  const pid = params.get('pid');
  const pstepId = params.get('stepId');
  const dataSaved = params.get('dataSaved');
  const launchedFromLauncher = dataSaved === "true";

  // ── Acquire recording streams once after consent ─────────────────────────
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

  // ── Task completion handler (called by DraftPanel for both conditions) ───
  const handleTaskComplete = useCallback((finalContent: string) => {
    logFinalSummarySubmitted(finalContent);
    logTaskEnd(false);
    nextStep();
  }, [logFinalSummarySubmitted, logTaskEnd, nextStep]);

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

      // ── Shared layout (Chat and Direct) ───────────────────────────────────
      // Left column: source document (top) + editable draft summary (bottom)
      // Right column: LLM interface (ChatGPT-like or DirectGPT-like, starts empty)
      const rightInterface = currentStep.isDirect
        ? <DirectInterface><TextualEntity /></DirectInterface>
        : <ChatInterface />;

      return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

          {/* Left column — source + draft stacked */}
          <div style={{
            width: '38%', minWidth: 320, maxWidth: 520,
            flexShrink: 0, height: '100%',
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid #ccc',
          }}>
            {/* Top: source document */}
            <div style={{ flex: '0 0 55%', overflow: 'hidden', borderBottom: '1px solid #ccc' }}>
              <SourcePanel task={currentTask} />
            </div>
            {/* Bottom: editable draft */}
            <div style={{ flex: '0 0 45%', overflow: 'hidden' }}>
              <DraftPanel task={currentTask} onSubmit={handleTaskComplete} />
            </div>
          </div>

          {/* Right column — interface */}
          <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
            {rightInterface}
          </div>

          {/* Overlays */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 999, color: 'gray' }}>
            <button onClick={() => { logEvent("USER_PRESSED_RESET"); startFresh(); }}>Reset</button>
          </div>
          <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 999, color: 'gray', pointerEvents: 'none' }}>
            {getTaskCode()}
          </div>
        </div>
      );
    }
  }

  return <StudyMessage message="Study is loading..." />;
}
