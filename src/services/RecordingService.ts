// ─── RecordingService ──────────────────────────────────────────────────────
// Manages audio (microphone) and screen recording across the whole session.
// Streams are acquired ONCE at session start so the participant only grants
// permissions a single time. Per-block, new MediaRecorder instances are
// created on the existing streams, and their chunks are stored as Blobs.

export interface BlockRecording {
  blockLabel: string;
  audioBlob: Blob | null;
  screenBlob: Blob | null;
}

class RecordingService {
  // Persistent streams — acquired once, reused across blocks
  private audioStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

  // Per-block recorders
  private audioRecorder: MediaRecorder | null = null;
  private screenRecorder: MediaRecorder | null = null;
  private audioChunks: BlobPart[] = [];
  private screenChunks: BlobPart[] = [];

  private completedBlocks: BlockRecording[] = [];
  private currentBlockLabel = '';

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Acquire microphone + screen streams once at session start.
   * Call this early (e.g. after consent) so the permission prompts only
   * appear once.  Returns which streams were successfully acquired.
   */
  async acquireStreams(): Promise<{ audioOk: boolean; screenOk: boolean }> {
    const audioOk = await this.acquireAudioStream();
    const screenOk = await this.acquireScreenStream();
    return { audioOk, screenOk };
  }

  /**
   * Start audio + screen recording for a new block, using the already-
   * acquired streams.  If a stream was not acquired, that recorder is
   * silently skipped.
   */
  startBlock(blockLabel: string): { audioOk: boolean; screenOk: boolean } {
    this.currentBlockLabel = blockLabel;
    this.audioChunks = [];
    this.screenChunks = [];

    const audioOk = this.startAudioRecorder();
    const screenOk = this.startScreenRecorder();
    return { audioOk, screenOk };
  }

  /**
   * Stop current block recorders and store the resulting Blobs.
   * Must be awaited before starting a new block.
   */
  async stopBlock(): Promise<void> {
    const [audioBlob, screenBlob] = await Promise.all([
      this.stopRecorder(this.audioRecorder, this.audioChunks, 'audio/webm'),
      this.stopRecorder(this.screenRecorder, this.screenChunks, 'video/webm'),
    ]);

    this.completedBlocks.push({
      blockLabel: this.currentBlockLabel,
      audioBlob,
      screenBlob,
    });

    this.audioRecorder = null;
    this.screenRecorder = null;
  }

  /** All finalized block recordings (accumulates across the session). */
  getCompletedBlocks(): BlockRecording[] {
    return this.completedBlocks;
  }

  /** Release streams and reset state (call between sessions). */
  clear(): void {
    this.audioStream?.getTracks().forEach((t) => t.stop());
    this.screenStream?.getTracks().forEach((t) => t.stop());
    this.audioStream = null;
    this.screenStream = null;
    this.completedBlocks = [];
    this.audioChunks = [];
    this.screenChunks = [];
    this.audioRecorder = null;
    this.screenRecorder = null;
  }

  // ── Stream acquisition (once per session) ─────────────────────────────

  private async acquireAudioStream(): Promise<boolean> {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (e) {
      console.warn('[RecordingService] Microphone unavailable:', e);
      return false;
    }
  }

  private async acquireScreenStream(): Promise<boolean> {
    try {
      this.screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: 10 },
        audio: false,
      });
      // If the user ends the screen share via the browser chrome, mark the
      // stream as gone so we don't try to create recorders on a dead track.
      this.screenStream!.getVideoTracks()[0].onended = () => {
        this.screenStream = null;
      };
      return true;
    } catch (e) {
      console.warn('[RecordingService] Screen capture unavailable:', e);
      return false;
    }
  }

  // ── Per-block recorder management ─────────────────────────────────────

  private startAudioRecorder(): boolean {
    if (!this.audioStream || this.audioStream.getTracks().every((t) => t.readyState === 'ended')) {
      return false;
    }
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      this.audioRecorder = new MediaRecorder(this.audioStream, { mimeType });
      this.audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      this.audioRecorder.start(1000);
      return true;
    } catch (e) {
      console.warn('[RecordingService] Audio recorder failed:', e);
      return false;
    }
  }

  private startScreenRecorder(): boolean {
    if (!this.screenStream || this.screenStream.getTracks().every((t) => t.readyState === 'ended')) {
      return false;
    }
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';
      this.screenRecorder = new MediaRecorder(this.screenStream, { mimeType });
      this.screenRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.screenChunks.push(e.data);
      };
      this.screenRecorder.start(1000);
      return true;
    } catch (e) {
      console.warn('[RecordingService] Screen recorder failed:', e);
      return false;
    }
  }

  private stopRecorder(
    recorder: MediaRecorder | null,
    chunks: BlobPart[],
    mimeType: string,
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!recorder || recorder.state === 'inactive') {
        resolve(chunks.length > 0 ? new Blob(chunks, { type: mimeType }) : null);
        return;
      }
      recorder.onstop = () => {
        resolve(chunks.length > 0 ? new Blob(chunks, { type: mimeType }) : null);
      };
      recorder.stop();
      // Do NOT stop tracks here — we reuse the streams across blocks
    });
  }
}

// Singleton — one instance shared across the whole app.
export const recordingService = new RecordingService();
