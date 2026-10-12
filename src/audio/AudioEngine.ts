import { tracks, type TrackId } from '../config/tracks';
import { sampleManifest } from '../config/sampleManifest';
import { audible, type Pattern } from '../sequencer/Pattern';
import { SampleBank } from './SampleBank';
import { Effects } from './Effects';
interface Voice { source: AudioBufferSourceNode; envelope: GainNode; when: number; ends: number; id: TrackId }
export interface TriggerOptions { velocity?: number; start?: number; gate?: number; preview?: boolean }
export class AudioEngine {
  context?: AudioContext;
  readonly bank = new SampleBank();
  private effects?: Effects;
  private channels = new Map<TrackId, GainNode>();
  private voices = new Set<Voice>();
  private loading?: Promise<void>;
  private announcement?: AudioBuffer;
  private announcementVoice?: AudioBufferSourceNode;
  async unlock() {
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: 'interactive' });
      this.effects = new Effects(this.context);
      tracks.forEach(({ id }) => { const gain = this.context!.createGain(); gain.connect(this.effects!.input); this.channels.set(id, gain); });
      this.loading = Promise.all([this.bank.load(this.context), this.loadAnnouncement(this.context)]).then(() => {});
    }
    await this.context.resume();
    await this.loading;
  }

  private async loadAnnouncement(context: AudioContext) {
    try {
      const response = await fetch('/samples/daechwita-announcement.m4a', { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`Announcement HTTP ${response.status}`);
      this.announcement = await context.decodeAudioData(await response.arrayBuffer());
    } catch (error) { console.warn('SMFP: opening announcement unavailable.', error); }
  }
  get announcementDuration() { return (this.announcement?.duration ?? 0) / 1.3 + .035; }
  playAnnouncement(): Promise<boolean> {
    const context = this.context, buffer = this.announcement;
    if (!context || !buffer) return Promise.resolve(false);
    return new Promise(resolve => {
      const source = context.createBufferSource(); source.buffer = buffer;
      // A clearly higher, brighter pitch gives the royal call a playful lift.
      source.playbackRate.value = 1.3;
      // Trim low rumble and high hiss from the supplied recording, with a subtle
      // presence lift for intelligibility. Avoid modulation and echo, which made
      // the announcement sound heavy and muddy.
      const highpass = context.createBiquadFilter(); highpass.type = 'highpass'; highpass.frequency.value = 120; highpass.Q.value = .707;
      const tone = context.createBiquadFilter(); tone.type = 'peaking'; tone.frequency.value = 2100; tone.Q.value = .8; tone.gain.value = 1.5;
      const lowpass = context.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 6800; lowpass.Q.value = .707;
      const output = context.createGain(); output.gain.value = .92;
      source.connect(highpass); highpass.connect(tone); tone.connect(lowpass); lowpass.connect(output); output.connect(context.destination);
      this.announcementVoice = source;
      source.onended = () => {
        source.disconnect(); highpass.disconnect(); tone.disconnect(); lowpass.disconnect(); output.disconnect();
        if (this.announcementVoice === source) this.announcementVoice = undefined;
        resolve(true);
      };
      source.start(context.currentTime + .035);
    });
  }
  stopAnnouncement() { if (this.announcementVoice) { try { this.announcementVoice.stop(); } catch { /* Already ended. */ } } }

  get recordingStream() { return this.effects?.recording.stream; }
  get time() { return this.context?.currentTime ?? 0; }
  get audibleTime() {
    const outputTime = this.context?.getOutputTimestamp?.().contextTime ?? 0;
    return outputTime > 0 ? outputTime : this.time;
  }
  updateMix(pattern: Pattern) {
    if (!this.context || !this.effects) return;
    tracks.forEach(({ id }) => this.channels.get(id)!.gain.setTargetAtTime(audible(pattern, id) ? pattern.tracks[id].volume : 0, this.time, .008));
    this.effects.update(pattern.reverb, pattern.delay, pattern.filter, pattern.bpm);
  }
  trigger(id: TrackId, when: number, options: TriggerOptions = {}) {
    const context = this.context, buffer = this.bank.get(id);
    if (!context || !buffer) return;
    const start = Math.max(0, Math.min(options.start ?? sampleManifest[id].start, buffer.duration - .001));
    const gate = Math.max(.012, Math.min(options.gate ?? sampleManifest[id].gate, buffer.duration - start));
    // Bound overlap at the scheduled time, including future voices in the look-ahead window.
    const overlapping = [...this.voices].filter(v => v.id === id && v.ends > when).sort((a, b) => a.when - b.when);
    while (overlapping.length >= (sampleManifest[id].maxVoices ?? 4)) this.release(overlapping.shift()!, when);
    const source = context.createBufferSource(); source.buffer = buffer;
    const envelope = context.createGain(); envelope.gain.value = 0;
    const output = options.preview ? this.effects?.input : this.channels.get(id);
    if (!output) return;
    source.connect(envelope); envelope.connect(output);
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(options.velocity ?? 1, when + .004);
    envelope.gain.setValueAtTime(options.velocity ?? 1, when + Math.max(.004, gate - .015));
    envelope.gain.linearRampToValueAtTime(0, when + gate);
    const voice: Voice = { source, envelope, when, ends: when + gate, id }; this.voices.add(voice);
    source.onended = () => { source.disconnect(); envelope.disconnect(); this.voices.delete(voice); };
    source.start(when, start); source.stop(when + gate + .005);
  }
  private release(voice: Voice, at: number) {
    voice.envelope.gain.cancelAndHoldAtTime(at);
    voice.envelope.gain.linearRampToValueAtTime(0, at + .008);
    voice.source.stop(at + .01); voice.ends = at + .01;
  }
  stopAll() { this.voices.forEach(voice => this.release(voice, this.time)); }
}
