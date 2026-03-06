import { create } from 'zustand';
import { useModelStore } from '../../model/Model';
import { downloadSessionZip } from '../../services/SessionDownloadManager';
import { StudyStep } from './StudyTaskGenerator';

// ─── Exported types (consumed by SessionDownloadManager) ───────────────────

export interface TaskTimingRecord {
  blockLabel: string;
  stepId: number;
  taskId: number;
  taskCode: string;
  condition: 'direct' | 'chat' | '';
  startTime: number;         // Unix ms — when TASK_START fired
  endTime: number | null;    // Unix ms — when TASK_END fired
  totalDurationMs: number | null;
  timedOut: boolean;
  timeToFirstInteractionMs: number | null; // ms from startTime to first user action
}

export interface QuizRecord {
  stepId: number;
  taskId: number;
  taskCode: string;
  condition: 'direct' | 'chat' | '';
  hallucinationSelfReport: number;
  expectedHallucinations: number;
  comprehensionAnswers: {
    questionIndex: number;
    question: string;
    selectedOption: number;
    correctIndex: number;
    isCorrect: boolean;
  }[];
}

export interface QuestionnaireRecord {
  direct: { mentalEffort: number; reliance: number; sourceEngagement: number };
  chat: { mentalEffort: number; reliance: number; sourceEngagement: number };
  submittedAt: number;
}

// ─── Store interface ───────────────────────────────────────────────────────

interface StudyModelState {
  participantId: number;
  stepId: number;
  steps: StudyStep[];
  taskId: number;
  isDataSaved: boolean;

  // ── Raw event log (active block) ──
  csvData: string;

  // ── Finalized block CSVs (accumulated across the session) ──
  csvBlocks: { label: string; csv: string }[];

  // ── Structured data stores ──
  timingData: TaskTimingRecord[];
  quizResults: QuizRecord[];
  questionnaireData: QuestionnaireRecord | null;

  // ── Per-task transient timing state ──
  taskStartTime: number | null;
  firstInteractionLogged: boolean;
}

interface StudyModelActions {
  setParticipantId: (participantId: number) => void;
  setStepId: (stepId: number) => void;
  setSteps: (steps: StudyStep[]) => void;
  nextStep: () => void;
  startFresh: () => void;
  getTaskCode: () => string;
  getCondition: () => 'direct' | 'chat' | '';

  /** Finalise the current CSV block (writes to csvBlocks[]) and optionally triggers download. */
  saveData: (clear?: boolean) => void;
  logEvent: (eventName: string, parameters?: any) => void;
  reset: () => void;
  setIsDataSaved: (isDataSaved: boolean) => void;

  // ── Timing ──
  logTaskStart: () => void;
  logTaskEnd: (timedOut: boolean) => void;
  logFirstInteraction: () => void;

  // ── Structured data ──
  addQuizResult: (record: Omit<QuizRecord, 'stepId' | 'taskId' | 'taskCode' | 'condition'>) => void;
  setQuestionnaireData: (data: QuestionnaireRecord) => void;

  // ── Session ZIP download ──
  downloadSessionZip: () => Promise<void>;
}

// ─── Initial state ─────────────────────────────────────────────────────────

const CSV_HEADER = 'Timestamp,Participant,StepId,StepType,TaskId,TaskCode,Condition,Event,Parameters';

const initialState: StudyModelState = {
  participantId: -1,
  stepId: -1,
  steps: [],
  taskId: 0,
  isDataSaved: false,
  csvData: CSV_HEADER,
  csvBlocks: [],
  timingData: [],
  quizResults: [],
  questionnaireData: null,
  taskStartTime: null,
  firstInteractionLogged: false,
};

// ─── Store ─────────────────────────────────────────────────────────────────

export const useStudyModelStore = create<StudyModelState & StudyModelActions>()((set, get) => ({
  ...initialState,

  reset: () => set(() => ({ ...initialState })),

  setParticipantId: (participantId) => set({ participantId }),
  setStepId: (stepId) => set({ stepId }),
  setSteps: (steps) => set({ steps }),

  getCondition: () => {
    const currentStep = get().steps[get().stepId];
    if (currentStep?.type === 'condition') {
      return currentStep.isDirect ? 'direct' : 'chat';
    }
    return '';
  },

  startFresh: () => {
    const currentStep = get().steps[get().stepId];
    useModelStore.getState().reset();

    if (currentStep?.type === 'condition' && currentStep.condition) {
      const setGptMessages = useModelStore.getState().setGptMessages;
      const setType = useModelStore.getState().setType;
      setType('text');
      const currentTask = currentStep.condition.tasks[get().taskId];
      if (currentTask) {
        setGptMessages([{ role: 'assistant', content: currentTask.hallucinatedSummary }]);
      }
    }
  },

  nextStep: () => {
    const currentStep = get().steps[get().stepId];
    // Still have tasks in the current condition block → advance task
    if (
      currentStep?.type === 'condition' &&
      currentStep.condition &&
      get().taskId + 1 < currentStep.condition.tasks.length
    ) {
      set((state) => ({ taskId: state.taskId + 1 }));
      get().startFresh();
      get().logEvent('NEXT_STEP', { previous: currentStep, now: get().steps[get().stepId] });
      return;
    }

    if (get().stepId + 1 < get().steps.length) {
      set((state) => ({ stepId: state.stepId + 1, taskId: 0 }));
      get().logEvent('NEXT_STEP', { previous: currentStep, now: get().steps[get().stepId] });

      if (get().steps[get().stepId].saveData) {
        get().saveData(true);
      }
      get().startFresh();
    }
  },

  getTaskCode: () => {
    const currentStep = get().steps[get().stepId];
    if (currentStep?.type === 'condition' && currentStep.condition) {
      const conditionLetter = currentStep.isDirect ? 'Direct' : 'Chat';
      const taskLetter = get().taskId === 0 ? 'Short' : 'Long';
      return `[${conditionLetter}] ${taskLetter}`;
    }
    return '';
  },

  logEvent(eventName: string, parameters?: any) {
    if (!get().isDataSaved) return;

    const currentStep = get().steps[get().stepId];
    if (!currentStep) return;

    let condition = '';
    if (currentStep.type === 'condition') {
      condition = currentStep.isDirect ? 'direct' : 'chat';
    }

    const strParams = parameters
      ? btoa(unescape(encodeURIComponent(JSON.stringify(parameters))))
      : '';

    const values = [
      Date.now(),
      get().participantId,
      get().stepId,
      currentStep.type,
      get().taskId,
      get().getTaskCode(),
      condition,
      eventName,
      strParams,
    ];

    set((state) => ({ csvData: state.csvData + '\n' + values.join(',') }));
  },

  // ── Timing actions ─────────────────────────────────────────────────────

  logTaskStart() {
    const now = Date.now();
    set({ taskStartTime: now, firstInteractionLogged: false });
    get().logEvent('TASK_START', { timestamp: now });
  },

  logTaskEnd(timedOut: boolean) {
    const now = Date.now();
    const startTime = get().taskStartTime;
    get().logEvent('TASK_END', { timestamp: now, timedOut });

    const currentStep = get().steps[get().stepId];
    const blockLabel = `P${get().participantId}_block${get().stepId}`;

    const record: TaskTimingRecord = {
      blockLabel,
      stepId: get().stepId,
      taskId: get().taskId,
      taskCode: get().getTaskCode(),
      condition: get().getCondition(),
      startTime: startTime ?? now,
      endTime: now,
      totalDurationMs: startTime !== null ? now - startTime : null,
      timedOut,
      timeToFirstInteractionMs: null, // filled by logFirstInteraction
    };

    set((state) => {
      // Replace an existing record for the same task, or append
      const existing = state.timingData.findIndex(
        (r) => r.stepId === record.stepId && r.taskId === record.taskId,
      );
      const updated = [...state.timingData];
      if (existing >= 0) {
        updated[existing] = { ...updated[existing], ...record };
      } else {
        updated.push(record);
      }
      return { timingData: updated };
    });
  },

  logFirstInteraction() {
    if (get().firstInteractionLogged) return;
    const now = Date.now();
    const startTime = get().taskStartTime;
    if (startTime === null) return;

    const timeToFirstInteractionMs = now - startTime;
    get().logEvent('FIRST_INTERACTION', { timeToFirstInteractionMs });
    set({ firstInteractionLogged: true });

    // Patch the current timing record
    set((state) => {
      const updated = state.timingData.map((r) =>
        r.stepId === state.stepId && r.taskId === state.taskId
          ? { ...r, timeToFirstInteractionMs }
          : r,
      );
      return { timingData: updated };
    });
  },

  // ── Structured data actions ────────────────────────────────────────────

  addQuizResult(partial) {
    const record: QuizRecord = {
      stepId: get().stepId,
      taskId: get().taskId,
      taskCode: get().getTaskCode(),
      condition: get().getCondition(),
      ...partial,
    };
    set((state) => ({ quizResults: [...state.quizResults, record] }));
  },

  setQuestionnaireData(data: QuestionnaireRecord) {
    set({ questionnaireData: data });
  },

  // ── CSV persistence ────────────────────────────────────────────────────

  saveData(clear = true) {
    if (!get().isDataSaved) return;

    const blockLabel = `P${get().participantId}_block${get().stepId}`;
    const csv = get().csvData;

    // Store the finalised block for ZIP assembly
    set((state) => ({
      csvBlocks: [...state.csvBlocks, { label: blockLabel, csv }],
    }));

    // Legacy per-block download (keeps existing experimenter workflow)
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `${blockLabel}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    if (clear) {
      set({ csvData: CSV_HEADER });
    }
  },

  // ── Session ZIP download ───────────────────────────────────────────────

  async downloadSessionZip() {
    await downloadSessionZip({
      participantId: get().participantId,
      csvBlocks: get().csvBlocks,
      timingData: get().timingData,
      quizResults: get().quizResults,
      questionnaireData: get().questionnaireData,
    });
  },

  setIsDataSaved: (isDataSaved) => set({ isDataSaved }),
}));
