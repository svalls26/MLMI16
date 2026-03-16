import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatInterface from "../ChatInterface";
import DirectInterface from "../DirectInterface";
import TextualEntity from "../entities/TextualEntity";
import { useModelStore } from "../../model/Model";
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

  const getLastGptMessage = useModelStore((state) => state.getLastGptMessage);

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

  // ── Task completion handler ───────────────────────────────────────────────
  // Called by SourcePanel (Direct condition) or DraftPanel (Chat condition).
  const handleTaskComplete = useCallback((finalContent: string) => {
    logFinalSummarySubmitted(finalContent);
    logTaskEnd(false);
    nextStep();
  }, [logFinalSummarySubmitted, logTaskEnd, nextStep]);

  // For the Direct condition the final content lives in the model store.
  const handleDirectSubmit = useCallback(() => {
    const lastMsg = getLastGptMessage();
    handleTaskComplete(lastMsg?.content ?? '');
  }, [getLastGptMessage, handleTaskComplete]);

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

      // ── Chat condition layout ─────────────────────────────────────────────
      // Left: source document  |  Centre: empty chat  |  Right: editable draft
      if (!currentStep.isDirect) {
        return (
          <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Left — source document */}
            <div style={{ width: '28%', minWidth: 260, maxWidth: 380, flexShrink: 0, height: '100%' }}>
              <SourcePanel task={currentTask} />
            </div>

            {/* Centre — ChatGPT-like interface (starts empty) */}
            <div style={{ flex: 1, height: '100%', overflow: 'hidden', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>
              <ChatInterface />
            </div>

            {/* Right — editable draft summary */}
            <div style={{ width: '30%', minWidth: 280, maxWidth: 420, flexShrink: 0, height: '100%' }}>
              <DraftPanel task={currentTask} onSubmit={handleTaskComplete} />
            </div>

            {/* Reset button overlay */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 999, color: 'gray' }}>
              <button onClick={() => { logEvent("USER_PRESSED_RESET"); startFresh(); }}>Reset</button>
            </div>
            <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 999, color: 'gray', pointerEvents: 'none' }}>
              {getTaskCode()}
            </div>
          </div>
        );
      }

      // ── Direct condition layout ───────────────────────────────────────────
      // Left: source document  |  Centre: DirectGPT (with summary content)
      // The PromptReuseToolbar is rendered inside DirectInterface on the right side.
      return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          {/* Left — source document + submit button */}
          <div style={{ width: '28%', minWidth: 260, maxWidth: 380, flexShrink: 0, height: '100%' }}>
            <SourcePanel
              task={currentTask}
              showSubmitButton={true}
              onSubmit={handleDirectSubmit}
            />
          </div>

          {/* Centre + Right — DirectGPT interface (includes PromptReuseToolbar on its right) */}
          <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
            <DirectInterface>
              <TextualEntity />
            </DirectInterface>
          </div>

          {/* Reset button overlay */}
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
