import { makePattern, migratePattern, type Pattern, type PresetId } from './Pattern';
import { tracks, type TrackId } from '../config/tracks';
export class SequencerStore {
  pattern: Pattern = makePattern();
  private listeners = new Set<() => void>();
  saveAvailable = true;
  constructor() {
    try {
      const raw = localStorage.getItem('smfp-pattern-v4') ?? localStorage.getItem('smfp-pattern-v3') ?? localStorage.getItem('smfp-pattern-v2') ?? localStorage.getItem('smfp-pattern-v1');
      if (raw) this.pattern = migratePattern(JSON.parse(raw)) ?? this.pattern;
    } catch { this.saveAvailable = false; }
  }
  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  change() {
    try { localStorage.setItem('smfp-pattern-v4', JSON.stringify(this.pattern)); } catch { this.saveAvailable = false; }
    this.listeners.forEach(fn => fn());
  }
  toggle(id: TrackId, step: number, accent = false) {
    const row = this.pattern.tracks[id].steps;
    row[step] = accent ? (row[step] === 1 ? .55 : 1) : row[step] ? 0 : .75;
    this.change();
  }
  load(id: PresetId) { this.pattern = makePattern(id); this.change(); }
  clear() { this.pattern.melody.fill('rest'); tracks.forEach(({ id }) => this.pattern.tracks[id].steps.fill(0)); this.change(); }
}
