import { melodyPhrases, phraseBeats } from '../config/melodyPhrases';
import { tracks } from '../config/tracks';
import { audible } from '../sequencer/Pattern';
import type { SequencerStore } from '../sequencer/SequencerStore';
import { visualBus, type VisualEvent } from '../visual/VisualEventBus';
import type { AudioEngine } from './AudioEngine';
export class Transport {
  playing = false;
  paused = false;
  onStep: (step: number) => void = () => {};
  onMelody: (slot: number) => void = () => {};
  private melodyEnds = 0;
  pendingLength?: 6 | 8 | 12;
  onLength: () => void = () => {};
  private melodySlot = 0;
  private melodyBeatsLeft = 0;
  onState: () => void = () => {};
  private step = 0;
  private nextTime = 0;
  private endTime = Infinity;
  private timer?: ReturnType<typeof setTimeout>;
  private frame = 0;
  private generation = 0;
  private queue: { time: number; step: number; events: VisualEvent[]; melodySlot?: number }[] = [];
  constructor(private engine: AudioEngine, private store: SequencerStore) {}
  async play(beats?: number) {
    if (this.playing) return;
    const token = ++this.generation;
    await this.engine.unlock();
    if (token !== this.generation) return;
    this.engine.updateMix(this.store.pattern);
    this.playing = true;
    if (!this.paused) { this.step = 0; this.melodySlot = 0; this.melodyBeatsLeft = 0; this.melodyEnds = 0; }
    this.paused = false; this.nextTime = this.engine.time + .06;
    this.endTime = beats === undefined ? Infinity : this.nextTime + beats * 60 / this.store.pattern.bpm;
    this.onState(); this.schedule(); this.draw();
  }
  pause() {
    if (!this.playing) return;
    this.generation++; this.playing = false; this.paused = true;
    clearTimeout(this.timer); cancelAnimationFrame(this.frame); this.queue = [];
    this.engine.stopAll(); this.onMelody(-1);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('smfp:melody-stop'));
    this.onStep(-1); this.onState();
  }
  stop() {
    this.generation++; this.playing = false; this.paused = false;
    clearTimeout(this.timer); cancelAnimationFrame(this.frame); this.queue = [];
    this.engine.stopAll();
    if (this.pendingLength) { this.store.pattern.length = this.pendingLength; this.pendingLength = undefined; this.onLength(); this.store.change(); }
    this.onMelody(-1); if (typeof window !== 'undefined') window.dispatchEvent(new Event('smfp:melody-stop')); this.onStep(-1); this.onState();
  }
  private schedule = () => {
    if (!this.playing) return;
    if (this.engine.time >= this.endTime) { this.stop(); return; }
    // Recover from a delayed callback without firing a burst of stale notes.
    if (this.nextTime < this.engine.time - .1) this.nextTime = this.engine.time + .02;
    while (this.nextTime < this.engine.time + .1 && this.nextTime < this.endTime - .0001) {
      const pattern = this.store.pattern;
      this.step %= pattern.length;
      const events: VisualEvent[] = [];
      let melodySlot: number | undefined;
      if (this.melodyBeatsLeft <= 0 && this.step === 0 && this.nextTime >= this.melodyEnds) {
        if (this.pendingLength) {
          pattern.length = this.pendingLength; this.pendingLength = undefined;
          this.onLength(); this.store.change();
        }
        melodySlot = this.melodySlot;
        const slot = pattern.melody[this.melodySlot];
        this.melodyBeatsLeft = phraseBeats(slot, pattern.bpm, pattern.length);
        if (slot !== 'rest' && audible(pattern, 'taepyeongso')) {
          const phrase = melodyPhrases[slot];
          this.melodyEnds = this.nextTime + phrase.duration + .04;
          this.engine.trigger('taepyeongso', this.nextTime, { start: phrase.start, gate: phrase.duration, velocity: .85 });
          events.push({ track: 'taepyeongso', velocity: .85, time: this.nextTime, step: this.step, duration: phrase.duration, phrase: slot });
        }
        this.melodySlot = (this.melodySlot + 1) % pattern.melody.length;
      }
      this.melodyBeatsLeft--;
      tracks.forEach(({ id }) => {
        if (id === 'taepyeongso') return;
        const velocity = pattern.tracks[id].steps[this.step];
        if (velocity > 0 && audible(pattern, id)) {
          this.engine.trigger(id, this.nextTime, { velocity });
          events.push({ track: id, velocity, time: this.nextTime, step: this.step });
        }
      });
      this.queue.push({ time: this.nextTime, step: this.step, events, melodySlot });
      this.nextTime += 60 / pattern.bpm;
      this.step = (this.step + 1) % pattern.length;
    }
    this.timer = setTimeout(this.schedule, 25);
  };
  private draw = () => {
    if (!this.playing) return;
    while (this.queue.length && this.queue[0].time <= this.engine.audibleTime) {
      const item = this.queue.shift()!;
      this.onStep(item.step);
      if (item.melodySlot !== undefined) this.onMelody(item.melodySlot);
      item.events.forEach(event => { if (audible(this.store.pattern, event.track)) visualBus.emit(event); });
    }
    this.frame = requestAnimationFrame(this.draw);
  };
}
