export type PalaceId = 'gyeongbok' | 'changdeok' | 'deoksu';
export interface PalaceTheme {
  id: PalaceId; palace: string; hall: string; description: string;
  accent: string; sky: number; mountain: readonly number[];
  peaks: readonly (readonly [number, number, number])[];
  profile: 'rounded' | 'faceted' | 'soft'; band: number;
  pine: 'winding' | 'spreading' | 'slender';
  wave: 'contour' | 'crest' | 'ribbon'; wavelength: number; waveHeight: number;
  colors: Record<number, number>;
}
// Visual interpretations of the three user-supplied photographs, not restorations.
const sourceMountains = [0xffdea1, 0xb8d684, 0x77b17d, 0x3e897c, 0x276c82, 0x285678, 0x254967];
function palette(sky: number, mountain: number[], leaves: number[], water: number[], trunk: number[], foam: number) {
  return {
    ...Object.fromEntries(sourceMountains.map((c, i) => [c, mountain[i]])),
    [0x082d69]: sky, [0x206196]: sky,
    [0x205947]: leaves[0], [0x39824d]: leaves[1], [0x63a24f]: leaves[2], [0x8abb58]: leaves[3], [0xd2d67c]: leaves[4],
    [0xc0d98a]: mountain[1], [0x497e7c]: mountain[3], [0x25566d]: mountain[5],
    [0x1c5484]:water[0], [0x164579]:water[0], [0x4289b2]:water[1], [0x99d0df]:water[2], [0x255e91]:water[3], [0x7ab7ce]:water[2], [0x72b2d0]:water[1],
    [0xe37442]:trunk[0], [0xb95138]:trunk[1], [0xf59351]:trunk[2], [0xffa15a]:trunk[2],
    [0xfffae6]:foam,
  };
}
const earth = [0xc6a574,0xa98e5d,0x8e7c51,0x726744,0x605940,0x514b3a,0x454338];
const jade = [0x99bd90,0x6ea586,0x45847a,0x326c78,0x2c536f,0x293e60,0x263650];
const olive = [0xe2d9ad,0xc9cb97,0xadb581,0x919d73,0x7a8a69,0x67785e,0x546b59];
export const palaceThemes: Record<PalaceId, PalaceTheme> = {
  gyeongbok: { id:'gyeongbok', palace:'경복궁', hall:'근정전', description:'푸른 하늘 · 황토빛 둥근 산 · 굽은 붉은 소나무', accent:'#ddb77b', sky:0x164e91, mountain:earth,
    peaks:[[129,128,193],[219,112,193],[320,75,222],[422,122,192],[520,137,185]], profile:'rounded', band:43, pine:'winding', wave:'contour', wavelength:112, waveHeight:12,
    colors:palette(0x164e91,earth,[0x304837,0x456044,0x5b714b,0x83905d,0xa6a875],[0x514c40,0x897b5a,0xc4ad7f,0x6a604a],[0xb94c37,0x843829,0xdc7650],0xeee0bd) },
  changdeok: { id:'changdeok', palace:'창덕궁', hall:'인정전', description:'청록빛 각진 바위산 · 넓게 뻗은 솔가지 · 힘찬 물보라', accent:'#8fc4af', sky:0x183c5b, mountain:jade,
    peaks:[[129,130,172],[219,91,190],[320,66,207],[422,101,184],[519,124,180]], profile:'faceted', band:30, pine:'spreading', wave:'crest', wavelength:76, waveHeight:20,
    colors:palette(0x183c5b,jade,[0x1d493e,0x28664e,0x407b5c,0x69a37a,0x98bf8a],[0x253e51,0x547568,0xa7bda0,0x354f51],[0xaf4c40,0x7e3434,0xd78363],0xf4e9c9) },
  deoksu: { id:'deoksu', palace:'덕수궁', hall:'중화전', description:'밝은 비단빛 하늘 · 완만한 연두 능선 · 잔잔한 물결', accent:'#d8d6a4', sky:0xe3dfc0, mountain:olive,
    peaks:[[134,147,188],[222,140,178],[320,113,210],[419,143,180],[509,153,188]], profile:'soft', band:48, pine:'slender', wave:'ribbon', wavelength:138, waveHeight:7,
    colors:{...palette(0xe3dfc0,olive,[0x53664b,0x6e8057,0x8c9a66,0xadb477,0xd5cd8f],[0x627c72,0x8ea595,0xd8dec1,0x7b9180],[0xbb7960,0x875948,0xdaaa7d],0xfff5d5),[0xffedb7]:0x8d985f,[0x9dcce0]:0x9caf9d,[0x91b8d5]:0xb9c9ba,[0x6699bf]:0x90aba8,[0xd2e1e0]:0xf0ead0} },
};
export function resolvePalace(value: unknown): PalaceId {
  return typeof value === 'string' && Object.hasOwn(palaceThemes, value) ? value as PalaceId : 'gyeongbok';
}
// Shared by solid terrain and reactive ridge highlights so contours stay aligned.
export function ridgeHeight(theme: PalaceTheme, dx: number, half: number, top: number): number {
  const q = Math.min(1, Math.abs(dx) / half);
  let curve = Math.pow(q, theme.profile === 'soft' ? 1.85 : 1.5);
  if (theme.profile === 'faceted') {
    const heights = [0, .09, .28, .43, .72, 1];
    const segment = Math.min(4, Math.floor(q * 5));
    curve = heights[segment] + (heights[segment + 1] - heights[segment]) * (q * 5 - segment);
  }
  if (theme.profile === 'rounded') curve += Math.sin(q * Math.PI * 4) * .022;
  return top + (298 - top) * Math.max(0, curve);
}
