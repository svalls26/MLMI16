// ─── RecordingService ──────────────────────────────────────────────────────
// Stub – recording has been removed. This module is kept as an empty
// singleton so that any stale imports do not break at runtime.

export interface BlockRecording {
  blockLabel: string;
}

class RecordingService {
  clear(): void {
    // no-op
  }
}

// Singleton — one instance shared across the whole app.
export const recordingService = new RecordingService();
