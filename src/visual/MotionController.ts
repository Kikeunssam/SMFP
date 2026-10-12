import type { TrackId } from '../config/tracks';
import { motionPresets } from '../config/motionPresets';
// Envelopes always resolve against a fixed origin. Retriggers replace energy, never add tweens.
export class MotionController {
  private energies = new Map<TrackId, number>();
  trigger(id: TrackId, velocity: number) { this.energies.set(id, Math.max(this.get(id), velocity * motionPresets[id].strength)); }
  get(id: TrackId) { return this.energies.get(id) ?? 0; }
  update(seconds: number) {
    this.energies.forEach((energy, id) => this.energies.set(id, Math.max(0, energy - seconds / motionPresets[id].decay)));
  }
}
