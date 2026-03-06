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
//   └── recordings/
//       ├── P{id}_block1_audio.webm
//       ├── P{id}_block1_screen.webm
//       ├── P{id}_block2_audio.webm
//       └── P{id}_block2_screen.webm

import JSZip from 'jszip';
import { recordingService } from './RecordingService';
import type { TaskTimingRecord, QuizRecord, QuestionnaireRecord } from '../view/study/StudyModel';

export interface SessionData {
  participantId: number;
  csvBlocks: { label: string; csv: string }[];
  timingData: TaskTimingRecord[];
  quizResults: QuizRecord[];
  questionnaireData: QuestionnaireRecord | null;
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
        recordingsAvailable: recordingService
          .getCompletedBlocks()
          .map((b) => ({
            block: b.blockLabel,
            hasAudio: b.audioBlob !== null,
            hasScreen: b.screenBlob !== null,
          })),
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

  // ── Media recordings ──
  for (const block of recordingService.getCompletedBlocks()) {
    if (block.audioBlob) {
      zip.file(`${root}/recordings/${block.blockLabel}_audio.webm`, block.audioBlob);
    }
    if (block.screenBlob) {
      zip.file(`${root}/recordings/${block.blockLabel}_screen.webm`, block.screenBlob);
    }
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
