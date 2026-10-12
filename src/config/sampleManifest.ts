import type { TrackId } from './tracks';
export interface SampleDefinition {
  url?: string;
  label: string;
  fallback: 'demo' | 'silent';
  start: number;
  gate: number;
  maxVoices?: number;
}
// Full supplied recordings are retained as AAC/M4A. Offset skips leading silence;
// gate selects a rhythm-friendly onset segment without changing pitch or playback rate.
export const sampleManifest: Record<TrackId, SampleDefinition> = {
  yonggo: { url:'/samples/yonggo.m4a', label:'용고 · 국립국악원', fallback:'silent', start:.40, gate:1.2, maxVoices:3 },
  janggu: { url:'/samples/janggu.m4a', label:'장구 · 국립국악원', fallback:'silent', start:.18, gate:1.2, maxVoices:3 },
  jing: { url:'/samples/jing.m4a', label:'징 · 국립국악원', fallback:'silent', start:.18, gate:12, maxVoices:2 },
  jabara: { url:'/samples/jabara.m4a', label:'자바라 · 국립국악원', fallback:'silent', start:.40, gate:2.2, maxVoices:2 },
  nabal: { url:'/samples/nabal.m4a', label:'나발 · 국립국악원', fallback:'silent', start:.18, gate:2.8, maxVoices:1 },
  nagak: { url:'/samples/nagak.m4a', label:'나각 · 국립국악원', fallback:'silent', start:.18, gate:2.4, maxVoices:1 },
  taepyeongso: { url:'/samples/taepyeongso-performance.m4a', label:'태평소 연주곡 대취타 · 가락 조각', fallback:'silent', start:40.20, gate:3.74, maxVoices:1 },
};
