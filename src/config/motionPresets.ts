import type { TrackId } from './tracks';
export const motionPresets: Record<TrackId, { decay: number; strength: number }> = {
  yonggo: { decay: .22, strength: 1 }, janggu: { decay: 1.1, strength: 1.4 },
  jing: { decay: 1.5, strength: 1 }, jabara: { decay: .65, strength: 1 },
  nabal: { decay: 1.2, strength: .9 }, nagak: { decay: 1.8, strength: 1 },
  taepyeongso: { decay: .24, strength: 1 },
};
