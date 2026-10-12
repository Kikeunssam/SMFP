import { sampleManifest } from '../config/sampleManifest';
import { tracks, type TrackId } from '../config/tracks';
export class SampleBank {
  private buffers = new Map<TrackId, AudioBuffer>();
  readonly status = new Map<TrackId, 'sample' | 'demo' | 'silent'>();
  async load(context: AudioContext) {
    await Promise.all(tracks.map(async ({ id }) => {
      const entry = sampleManifest[id];
      if (entry.url) {
        try {
          const response = await fetch(entry.url, { signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error(`Sample HTTP ${response.status}`);
          this.buffers.set(id, await context.decodeAudioData(await response.arrayBuffer()));
          this.status.set(id, 'sample'); return;
        } catch (error) { console.warn(`SMFP: ${id} sample unavailable; using ${entry.fallback} fallback.`, error); }
      }
      this.status.set(id, entry.fallback);
      if (entry.fallback === 'demo') this.buffers.set(id, this.demo(context, id));
    }));
  }
  get(id: TrackId) { return this.buffers.get(id); }
  private demo(context: AudioContext, id: TrackId): AudioBuffer {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 2.5), context.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 7919, phase = 0, smoothNoise = 0;
    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      seed = (seed * 16807) % 2147483647;
      const noise = seed / 1073741824 - 1;
      smoothNoise = smoothNoise * .93 + noise * .07;
      const sine = (frequency: number) => Math.sin(2 * Math.PI * frequency * t);
      let v = 0;
      if (id === 'yonggo') { phase += 2 * Math.PI * (49 + 90 * Math.exp(-t * 32)) / context.sampleRate; v = Math.sin(phase) * Math.exp(-t * 8) + noise * Math.exp(-t * 70) * .15; }
      if (id === 'janggu') v = (.5 * sine(185) + .25 * sine(297) + noise * .35) * Math.exp(-t * 20);
      if (id === 'jing') v = (sine(174) + .4 * sine(281) + .24 * sine(407) + .1 * noise) * Math.exp(-t * 2.2) * .35;
      if (id === 'jabara') v = (noise * .5 + sine(1703) * .12 + sine(2309) * .12) * Math.exp(-t * 8);
      if (id === 'nabal') v = (sine(146.83) * .55 + sine(293.66) * .25 + sine(440.49) * .15) * Math.min(1, t * 20) * Math.exp(-t * 1.9) * .55;
      if (id === 'nagak') v = (sine(73.42) + .3 * sine(146.84) + smoothNoise * .3) * Math.min(1, t * 7) * Math.exp(-t * 1.8) * .55;
      if (id === 'taepyeongso') v = (sine(587.33) * .55 + sine(1174.66) * .25 + sine(1761.99) * .1 + noise * .03) * Math.min(1, t * 90) * Math.exp(-t * 8) * .55;
      data[i] = Math.tanh(v) * .85 * Math.min(1, t * 1000) * Math.min(1, (2.5 - t) * 100);
    }
    return buffer;
  }
}
