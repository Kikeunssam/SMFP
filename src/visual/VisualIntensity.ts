import { tracks } from '../config/tracks';
import { audible, type Pattern } from '../sequencer/Pattern';
export function calculateIntensity(pattern: Pattern): number {
  let active = 0, hits = 0;
  tracks.forEach(({ id }) => {
    if (!audible(pattern, id)) return;
    if (id === 'taepyeongso') {
      const count = pattern.melody.filter(s => s !== 'rest').length;
      if (count) active++;
      hits += count / 3 * pattern.length * .25 * pattern.tracks[id].volume;
      return;
    }
    const steps = pattern.tracks[id].steps.slice(0, pattern.length);
    if (steps.some(v => v > 0)) active++;
    hits += steps.reduce((sum, velocity) => sum + velocity, 0) * pattern.tracks[id].volume;
  });
  return Math.min(1, active / tracks.length * .4 + hits / (pattern.length * 1.5) * .6);
}
export class VisualIntensity {
  value = 0;
  update(target: number, dt: number) { this.value += (target - this.value) * (1 - Math.exp(-dt * 3)); }
}
