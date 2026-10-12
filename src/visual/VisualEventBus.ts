import type { TrackId } from '../config/tracks';
export interface VisualEvent { track: TrackId; velocity: number; time: number; step: number; duration?: number; phrase?: string }
export class VisualEventBus {
  private listeners = new Set<(event: VisualEvent) => void>();
  on(fn: (event: VisualEvent) => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(event: VisualEvent) { this.listeners.forEach(fn => fn(event)); }
}
export const visualBus = new VisualEventBus();
