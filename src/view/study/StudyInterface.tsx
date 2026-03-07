import React, { useEffect, useRef } from "react";
import ChatInterface from "../ChatInterface";
import DirectInterface from "../DirectInterface";
import TextualEntity from "../entities/TextualEntity";
import { recordingService } from "../../services/RecordingService";
import CognitiveEffortQuestionnaire from "./CognitiveEffortQuestionnaire";
import StudyMessage from "./StudyMessage";
import { useStudyModelStore } from "./StudyModel";
import { StudyCondition, StudyStep, StudyTaskGenerator } from "./StudyTaskGenerator";
import StudyVideo from "./StudyVideo";
import StudyWarmup from "./StudyWarmup";
import TaskPanel from "./TaskPanel";

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
  const setIsDataSaved = useStudyModelStore((state) => state.setIsDataSaved);
  const isDataSaved = useStudyModelStore((state) => state.isDataSaved);
  const downloadZip = useStudyModelStore((state) => state.downloadSessionZip);

  // Track the previous step so we can detect condition → non-condition transitions
  const prevStepRef = useRef<StudyStep | null>(null);

  // Use URL parameters to generate the steps
  const hashSplitted = window.location.hash.split("?");
  const search = hashSplitted[hashSplitted.length - 1];
  const params = new URLSearchParams(search);
  const pid = params.get('pid');
  const pstepId = params.get('stepId');
  const dataSaved = params.get('dataSaved');
  const launchedFromLauncher = dataSaved === "true";

  // ── Recording lifecycle ────────────────────────────────────────────────────
  // Start recording when entering a condition step; stop + finalize CSV block
  // when leaving one.
  useEffect(() => {
    const currentStep = steps[stepId];
    const prevStep = prevStepRef.current;

    if (!isDataSaved) {
      prevStepRef.current = currentStep ?? null;
      return;
    }

    // Leaving a condition step → stop recording and finalise the CSV block
    if (prevStep?.type === 'condition' && currentStep?.type !== 'condition') {
      recordingService.stopBlock().then(() => {
        logEvent('RECORDING_STOPPED', { stepId: prevStep });
      });
      // Finalize the CSV for this block into csvBlocks[]
      // (saveData() already handles this when saveData flag is present;
      //  we call it here unconditionally so both blocks are always captured)
      useStudyModelStore.getState().saveData(true);
    }

    // Entering a condition step → start recording
    if (currentStep?.type === 'condition' && prevStep?.type !== 'condition') {
      const blockLabel = `P${participantId}_block${stepId}`;
      recordingService.startBlock(blockLabel).then(({ audioOk, screenOk }) => {
        logEvent('RECORDING_STARTED', { blockLabel, audioOk, screenOk });
      });
    }

    prevStepRef.current = currentStep ?? null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  // ──────────────────────────────────────────────────────────────────────────

  // If not launched from the Launcher (dataSaved param absent), redirect there
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

  // Last step in the sequence → show debrief with ZIP download button
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
      const currentTask = condition.tasks[taskId];

      let currentInterface: React.ReactNode;

      if (currentStep.isDirect) {
        currentInterface = (
          <DirectInterface leftSide={<TaskPanel task={currentTask} />}>
            <TextualEntity />
          </DirectInterface>
        );
      } else {
        currentInterface = (
          <ChatInterface leftSide={<TaskPanel task={currentTask} />} />
        );
      }

      return (
        <>
          {currentInterface}
          <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 999, color: 'gray' }}>
            <button onClick={() => { logEvent("USER_PRESSED_RESET"); startFresh(); }}>Reset</button>
          </div>
          <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 999, color: 'gray', pointerEvents: 'none' }}>
            {getTaskCode()}
          </div>
        </>
      );
    }
  }

  return <StudyMessage message="Study is loading..." />;
}
