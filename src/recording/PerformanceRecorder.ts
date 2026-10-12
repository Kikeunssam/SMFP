export const recordingBeats = (length: number) => length === 6 ? 24 : length === 8 ? 32 : 36;
export class PerformanceRecorder {
  private recorder?: MediaRecorder;
  private stream?: MediaStream;
  private chunks: Blob[] = [];
  private timer?: ReturnType<typeof setInterval>;
  private startedAt = 0;
  private url?: string;
  active = false;
  saving = false;
  onTime: (seconds: number) => void = () => {};
  onSaved: (url: string, filename: string) => void = () => {};
  onError: (message: string) => void = () => {};
  static mimeType() {
    if (typeof MediaRecorder === 'undefined') return undefined;
    return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4'].find(type => MediaRecorder.isTypeSupported(type));
  }
  start(canvas: HTMLCanvasElement, audio: MediaStream, clock: () => number) {
    const mimeType = PerformanceRecorder.mimeType();
    if (!mimeType || !canvas.captureStream) throw new Error('이 브라우저는 MP4 녹화를 지원하지 않아요. 최신 Chrome 또는 Safari에서 열어 주세요.');
    const video = canvas.captureStream(30);
    this.stream = new MediaStream([...video.getVideoTracks(), ...audio.getAudioTracks().map(track => track.clone())]);
    try {
      this.recorder = new MediaRecorder(this.stream, { mimeType, videoBitsPerSecond: 4000000, audioBitsPerSecond: 192000 });
      this.chunks = [];
      this.recorder.ondataavailable = event => { if (event.data.size) this.chunks.push(event.data); };
      this.recorder.onerror = () => { this.onError('녹화 중 문제가 생겼어요. 저장된 부분을 확인해 주세요.'); this.stop(); };
      this.recorder.onstop = () => {
        this.cleanup();
        const blob = new Blob(this.chunks, { type: mimeType });
        this.chunks = []; this.saving = false;
        if (!blob.size) { this.onError('녹화된 영상이 없어요. 다시 시도해 주세요.'); return; }
        if (this.url) URL.revokeObjectURL(this.url);
        this.url = URL.createObjectURL(blob);
        const filename = `일월오봉-${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`;
        const link = document.createElement('a'); link.href = this.url; link.download = filename;
        document.body.append(link); link.click(); link.remove();
        this.onSaved(this.url, filename);
      };
      this.recorder.start(200);
      this.active = true; this.startedAt = clock(); this.onTime(0);
      this.timer = setInterval(() => this.onTime(Math.max(0, clock() - this.startedAt)), 100);
    } catch (error) { this.cleanup(); throw error; }
  }
  stop() {
    if (!this.active) return;
    this.active = false; this.saving = true;
    clearInterval(this.timer);
    if (this.recorder?.state !== 'inactive') this.recorder?.stop();
  }
  private cleanup() { clearInterval(this.timer); this.stream?.getTracks().forEach(track => track.stop()); this.stream = undefined; }
}
