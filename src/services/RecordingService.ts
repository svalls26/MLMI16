// ─── RecordingService ──────────────────────────────────────────────────────
// Manages per-block audio (microphone) and screen MediaRecorder instances.
// Audio captures the participant's think-aloud voice.
// Screen captures cursor / interaction behaviour.
// Both recorders write to in-memory chunk arrays and expose Blobs on stop.

export interface BlockRecording {
  blockLabel: string;
  audioBlob: Blob | null;
  screenBlob: Blob | null;
}

class RecordingService {
  private audioRecorder: MediaRecorder | null = null;
  private screenRecorder: MediaRecorder | null = null;
  private audioChunks: BlobPart[] = [];
  private screenChunks: BlobPart[] = [];
  private completedBlocks: BlockRecording[] = [];
  private currentBlockLabel = '';

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Start audio + screen recording for a new block.
   * Returns which streams were successfully acquired so the caller can log it.
   */
  async startBlock(blockLabel: string): Promise<{ audioOk: boolean; screenOk: boolean }> {
    this.currentBlockLabel = blockLabel;
    this.audioChunks = [];
    this.screenChunks = [];

    const audioOk = await this.startAudio();
    const screenOk = await this.startScreen();
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

  /** Reset state (call between study sessions if reusing the page). */
  clear(): void {
    this.completedBlocks = [];
    this.audioChunks = [];
    this.screenChunks = [];
    this.audioRecorder = null;
    this.screenRecorder = null;
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  private async startAudio(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      this.audioRecorder = new MediaRecorder(stream, { mimeType });
      this.audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      this.audioRecorder.start(1000); // flush a chunk every second
      return true;
    } catch (e) {
      console.warn('[RecordingService] Microphone unavailable:', e);
      return false;
    }
  }

  private async startScreen(): Promise<boolean> {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: 10 }, // 10 fps is sufficient for interaction analysis
        audio: false,             // voice is captured separately via microphone
      });
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';
      this.screenRecorder = new MediaRecorder(stream, { mimeType });
      this.screenRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.screenChunks.push(e.data);
      };
      // Stop recording automatically if the user ends screen share via the browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (this.screenRecorder && this.screenRecorder.state !== 'inactive') {
          this.screenRecorder.stop();
        }
      };
      this.screenRecorder.start(1000);
      return true;
    } catch (e) {
      console.warn('[RecordingService] Screen capture unavailable:', e);
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
      recorder.stream.getTracks().forEach((t) => t.stop());
    });
  }
}

// Singleton — one instance shared across the whole app.
export const recordingService = new RecordingService();
