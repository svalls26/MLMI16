// ─── SessionDownloadManager ────────────────────────────────────────────────
// Assembles all collected study data into a single ZIP archive and
// triggers a browser download at the end of the session.
//
// ZIP layout:
//   P{id}_session_{YYYY-MM-DD}/
//   ├── session_metadata.json
//   ├── events/
//   │   ├── P{id}_block1_events.csv
//   │   └── P{id}_block2_events.csv
//   ├── timing/
//   │   └── P{id}_timing.json
//   ├── quiz/
//   │   └── P{id}_quiz_results.json
//   ├── questionnaire/
//   │   └── P{id}_cognitive_offloading.json
//   ├── conversations/
//   │   └── P{id}_conversations.json
//   └── manipulative_behavior/
//       └── P{id}_manipulative_behavior.json

import JSZip from 'jszip';
import type {
  TaskTimingRecord,
  QuizRecord,
  QuestionnaireRecord,
  TaskConversationRecord,
  ManipulativeBehaviorRecord,
} from '../view/study/StudyModel';

export interface SessionData {
  participantId: number;
  csvBlocks: { label: string; csv: string }[];
  timingData: TaskTimingRecord[];
  quizResults: QuizRecord[];
  questionnaireData: QuestionnaireRecord | null;
  conversationLogs: TaskConversationRecord[];
  manipulativeBehavior: ManipulativeBehaviorRecord[];
}

export async function downloadSessionZip(data: SessionData): Promise<void> {
  const zip = new JSZip();
  const date = new Date().toISOString().split('T')[0];
  const pid = data.participantId;
  const root = `P${pid}_session_${date}`;

  // ── Session metadata ──
  zip.file(
    `${root}/session_metadata.json`,
    JSON.stringify(
      {
        participantId: pid,
        date,
        exportedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        totalBlocks: data.csvBlocks.length,
        totalTasks: data.timingData.length,
      },
      null,
      2,
    ),
  );

  // ── Event logs (one CSV per block) ──
  for (const block of data.csvBlocks) {
    zip.file(`${root}/events/${block.label}_events.csv`, block.csv);
  }

  // ── Task timing ──
  zip.file(
    `${root}/timing/P${pid}_timing.json`,
    JSON.stringify(data.timingData, null, 2),
  );

  // ── Quiz / comprehension results ──
  zip.file(
    `${root}/quiz/P${pid}_quiz_results.json`,
    JSON.stringify(data.quizResults, null, 2),
  );

  // ── Cognitive offloading questionnaire ──
  if (data.questionnaireData) {
    zip.file(
      `${root}/questionnaire/P${pid}_cognitive_offloading.json`,
      JSON.stringify(data.questionnaireData, null, 2),
    );
  }

  // ── Conversation logs (chat messages + final summary per task) ──
  if (data.conversationLogs.length > 0) {
    zip.file(
      `${root}/conversations/P${pid}_conversations.json`,
      JSON.stringify(data.conversationLogs, null, 2),
    );
  }

  // ── Manipulative behavior (DirectGPT: selections, drops, undo/redo) ──
  if (data.manipulativeBehavior.length > 0) {
    zip.file(
      `${root}/manipulative_behavior/P${pid}_manipulative_behavior.json`,
      JSON.stringify(data.manipulativeBehavior, null, 2),
    );
  }

  // ── Generate & trigger download ──
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }, // balanced speed vs size
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${root}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
