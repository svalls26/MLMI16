import { create } from 'zustand';
import { useModelStore, MessageGPT } from '../../model/Model';
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
  direct?: { mentalEffort: number; reliance: number; sourceEngagement: number };
  chat?: { mentalEffort: number; reliance: number; sourceEngagement: number };
  submittedAt: number;
}

export interface TaskConversationRecord {
  stepId: number;
  taskId: number;
  taskCode: string;
  condition: 'direct' | 'chat' | '';
  messages: MessageGPT[];
  finalSummary: string;
}

export interface ManipulativeBehaviorRecord {
  stepId: number;
  taskId: number;
  taskCode: string;
  condition: 'direct' | 'chat' | '';
  textSelections: number;
  dropsToPrompt: number;
  undoCount: number;
  redoCount: number;
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
  conversationLogs: TaskConversationRecord[];
  manipulativeBehavior: ManipulativeBehaviorRecord[];

  // ── Per-task transient counters (reset each task) ──
  _textSelections: number;
  _dropsToPrompt: number;
  _undoCount: number;
  _redoCount: number;

  // ── Per-task transient timing state ──
  taskStartTime: number | null;
  firstInteractionLogged: boolean;

  // ── Second-pass review phase ──
  phase: 'first-pass' | 'second-pass';
  firstPassSummary: string | null;
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
  setQuestionnaireData: (data: Partial<Omit<QuestionnaireRecord, 'submittedAt'>>) => void;

  // ── Manipulative behavior counters ──
  incrementTextSelections: () => void;
  incrementDropsToPrompt: () => void;
  incrementUndo: () => void;
  incrementRedo: () => void;

  // ── Draft editing ──
  logDraftEdit: (content: string) => void;
  logFinalSummarySubmitted: (content: string) => void;

  // ── Second-pass review ──
  submitForReview: (content: string) => void;
  chooseEditFurther: () => void;
  finishTask: (content: string) => void;

  // ── Session ZIP download ──
  downloadSessionZip: () => Promise<void>;
}

// ─── Initial state ─────────────────────────────────────────────────────────

const CSV_HEADER = 'Timestamp,Participant,StepId,StepType,TaskId,TaskCode,Condition,Phase,Event,Parameters';

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
  conversationLogs: [],
  manipulativeBehavior: [],
  _textSelections: 0,
  _dropsToPrompt: 0,
  _undoCount: 0,
  _redoCount: 0,
  taskStartTime: null,
  firstInteractionLogged: false,
  phase: 'first-pass',
  firstPassSummary: null,
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
    set({ phase: 'first-pass', firstPassSummary: null });
    useModelStore.getState().reset();

    if (currentStep?.type === 'condition' && currentStep.condition) {
      const setGptMessages = useModelStore.getState().setGptMessages;
      const setType = useModelStore.getState().setType;
      setType('text');

      // Both conditions: pre-load the hallucinated summary as the first assistant
      // message so participants see the draft immediately and can interact with it.
      const task = currentStep.condition.task;
      if (task) {
        setGptMessages([{ role: 'assistant', content: task.hallucinatedSummary }]);
      } else {
        setGptMessages([]);
      }
    }
  },

  nextStep: () => {
    const currentStep = get().steps[get().stepId];

    // Each condition step now holds exactly one task — always advance to next step.
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
      const conditionLabel = currentStep.isDirect ? 'Direct' : 'Chat';
      const taskCode = currentStep.condition.task?.taskCode ?? '';
      return `[${conditionLabel}] ${taskCode}`;
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
      get().phase,
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

  setQuestionnaireData(data: Partial<Omit<QuestionnaireRecord, 'submittedAt'>>) {
    set((state) => ({
      questionnaireData: {
        ...(state.questionnaireData ?? {}),
        ...data,
        submittedAt: Date.now(),
      },
    }));
  },

  // ── Manipulative behavior counters ─────────────────────────────────────

  incrementTextSelections() {
    set((state) => ({ _textSelections: state._textSelections + 1 }));
  },

  incrementDropsToPrompt() {
    set((state) => ({ _dropsToPrompt: state._dropsToPrompt + 1 }));
  },

  incrementUndo() {
    set((state) => ({ _undoCount: state._undoCount + 1 }));
  },

  incrementRedo() {
    set((state) => ({ _redoCount: state._redoCount + 1 }));
  },

  // ── Draft editing actions ──────────────────────────────────────────────

  logDraftEdit(content: string) {
    get().logEvent('DRAFT_EDITED', { contentLength: content.length, content });
  },

  logFinalSummarySubmitted(content: string) {
    get().logEvent('FINAL_SUMMARY_SUBMITTED', { content });
  },

  // ── Second-pass review actions ─────────────────────────────────────────

  submitForReview(content: string) {
    get().logEvent('FIRST_PASS_SUBMITTED', { content });
    set({ firstPassSummary: content });
  },

  chooseEditFurther() {
    get().logEvent('REVIEW_EDIT_FURTHER', {});
    set({ phase: 'second-pass' });
  },

  finishTask(content: string) {
    get().logFinalSummarySubmitted(content);

    // ── Capture conversation log + final summary for this task ──
    const conversationRecord: TaskConversationRecord = {
      stepId: get().stepId,
      taskId: get().taskId,
      taskCode: get().getTaskCode(),
      condition: get().getCondition(),
      messages: [...useModelStore.getState().gptMessages],
      finalSummary: content,
    };
    set((state) => ({
      conversationLogs: [...state.conversationLogs, conversationRecord],
    }));

    // ── Capture manipulative behavior counts for this task ──
    const behaviorRecord: ManipulativeBehaviorRecord = {
      stepId: get().stepId,
      taskId: get().taskId,
      taskCode: get().getTaskCode(),
      condition: get().getCondition(),
      textSelections: get()._textSelections,
      dropsToPrompt: get()._dropsToPrompt,
      undoCount: get()._undoCount,
      redoCount: get()._redoCount,
    };
    set((state) => ({
      manipulativeBehavior: [...state.manipulativeBehavior, behaviorRecord],
      _textSelections: 0,
      _dropsToPrompt: 0,
      _undoCount: 0,
      _redoCount: 0,
    }));

    get().logTaskEnd(false);
    set({ phase: 'first-pass', firstPassSummary: null });
    get().nextStep();
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
      conversationLogs: get().conversationLogs,
      manipulativeBehavior: get().manipulativeBehavior,
    });
  },

  setIsDataSaved: (isDataSaved) => set({ isDataSaved }),
}));
