import { defaultMelody, type MelodySlot } from '../config/melodyPhrases';
import { tracks, type TrackId } from '../config/tracks';
export type PresetId = 'procession' | 'moonrise' | 'highTide' | 'custom';
export interface TrackState { steps: number[]; mute: boolean; solo: boolean; volume: number }
export interface Pattern { melody: MelodySlot[]; bpm: number; length: 6 | 8 | 12; tracks: Record<TrackId, TrackState>; reverb: number; delay: number; filter: number }
const presets: Record<Exclude<PresetId, 'custom'>, number[][]> = {
  // 왕의 행차: 넓은 간격의 북, 장구 응답, 징과 나발의 장중한 표식.
  procession: [[0, 4, 8], [2, 6, 10], [0, 6], [6], [0, 6], [3, 9], []],
  // 달빛 연회: 느린 북과 장구 사이에 달빛 징만 드문드문 놓는다.
  moonrise: [[0, 6], [3, 9], [0], [], [], [0, 6], []],
  // 축제 행렬: 빠른 북·장구 엇박과 징, 자바라를 촘촘하게 겹친다.
  highTide: [[0, 3, 4, 6, 8, 9], [1, 2, 4, 5, 7, 8, 10, 11], [0, 6], [2, 5, 8, 11], [0, 6], [3, 9], []],
};
const presetSettings: Record<Exclude<PresetId, 'custom'>, { bpm: number; melody: MelodySlot[]; reverb: number; delay: number }> = {
  procession: { bpm: 96, melody: ['a', 'rest', 'c'], reverb: .2, delay: .08 },
  moonrise: { bpm: 78, melody: ['b', 'rest', 'a'], reverb: .36, delay: .2 },
  highTide: { bpm: 138, melody: ['a', 'b', 'rest'], reverb: .16, delay: .15 },
};
export function makePattern(id: PresetId = 'procession'): Pattern {
  const settings = id === 'custom' ? { bpm: 90, melody: ['rest', 'rest', 'rest'] as MelodySlot[], reverb: .2, delay: .08 } : presetSettings[id];
  return { melody: [...settings.melody], bpm: settings.bpm, length: 12, reverb: settings.reverb, delay: settings.delay, filter: 1,
    tracks: Object.fromEntries(tracks.map((track, i) => [track.id, {
      steps: Array.from({ length: 12 }, (_, step) => id !== 'custom' && presets[id][i].includes(step % 12) ? (step % 4 === 0 ? 1 : .7) : 0),
      mute: false, solo: false, volume: track.volume,
    }])) as Record<TrackId, TrackState>,
  };
}
export function audible(pattern: Pattern, id: TrackId): boolean {
  const anySolo = tracks.some(t => pattern.tracks[t.id].solo);
  const track = pattern.tracks[id];
  return !track.mute && (!anySolo || track.solo) && track.volume > 0;
}
export function validatePattern(value: unknown): Pattern | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Pattern;
  if (![6, 8, 12].includes(p.length) || !Number.isFinite(p.bpm) || p.bpm < 70 || p.bpm > 150) return null;
  if (!['reverb', 'delay', 'filter'].every(k => Number.isFinite(p[k as 'delay']) && p[k as 'delay'] >= 0 && p[k as 'delay'] <= 1)) return null;
  for (const { id } of tracks) {
    const t = p.tracks?.[id];
    if (!t || !Array.isArray(t.steps) || t.steps.length !== 12 || !t.steps.every(v => Number.isFinite(v) && v >= 0 && v <= 1)
      || typeof t.mute !== 'boolean' || typeof t.solo !== 'boolean' || !Number.isFinite(t.volume) || t.volume < 0 || t.volume > 1) return null;
  }
  if (!Array.isArray(p.melody) || p.melody.length !== 3 || !p.melody.every(s => ['a', 'b', 'c', 'rest'].includes(s))) return null;
  return p;
}

// Preserve supported tracks and mix settings from v1/v2 saves; retire texture.
export function migratePattern(value: unknown): Pattern | null {
  if (!value || typeof value !== 'object') return null;
  const old = value as { length?: number; tracks?: Record<string, TrackState> };
  if (![6, 8, 12, 16, 32].includes(old.length ?? 0) || !old.tracks) return null;
  if (!tracks.every(({ id }) => Array.isArray(old.tracks?.[id]?.steps) && [12, 16, 32].includes(old.tracks[id].steps.length))) return null;
  return validatePattern({ ...value, melody: 'melody' in value ? value.melody : defaultMelody(), length: Math.min(old.length!, 12),
    tracks: Object.fromEntries(tracks.map(({ id }) => [id, { ...old.tracks![id], steps: old.tracks![id].steps.slice(0, 12) }])) });
}
