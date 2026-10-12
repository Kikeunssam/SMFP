// Candidate breath-separated excerpts found from the supplied performance's quiet gaps.
// These are editorial clip names, not transcriptions or claims of traditional meter.
export const melodyPhrases = {
  a: { name: '가락 하나', start: 40.20, duration: 3.74, color: '#ddbc70' },
  b: { name: '가락 둘', start: 56.72, duration: 4.42, color: '#8ec9c4' },
  c: { name: '가락 셋', start: 22.04, duration: 6.90, color: '#bc9cd8' },
};
export type PhraseId = keyof typeof melodyPhrases;
export type MelodySlot = PhraseId | 'rest';
export function phraseBeats(slot: MelodySlot, bpm: number, length: number): number {
  if (slot === 'rest') return length;
  return Math.max(1, Math.ceil((melodyPhrases[slot].duration + .04) / (60 / bpm) / length)) * length;
}
export const defaultMelody = (): MelodySlot[] => ['a', 'rest', 'b'];
