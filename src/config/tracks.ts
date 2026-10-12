export const tracks = [
  { id: 'yonggo', name: '용고', korean: '용고', role: '산을 깨우는 둥둥', color: '#ff8664', key: '1', volume: .8 },
  { id: 'janggu', name: '장구', korean: '장구', role: '톡톡 흐르는 폭포', color: '#f6c85f', key: '2', volume: .65 },
  { id: 'jing', name: '징', korean: '징', role: '동그란 달빛', color: '#f5e5ac', key: '3', volume: .55 },
  { id: 'jabara', name: '자바라', korean: '자바라', role: '반짝이는 햇살', color: '#ff9a87', key: '4', volume: .45 },
  { id: 'nabal', name: '나발', korean: '나발', role: '산 너머 울림', color: '#67c7ab', key: '5', volume: .5 },
  { id: 'nagak', name: '나각', korean: '나각', role: '들썩이는 소나무', color: '#7ab8ef', key: '6', volume: .5 },
  { id: 'taepyeongso', name: '태평소', korean: '태평소', role: '하늘을 가르는 선율', color: '#d3a2e8', key: '7', volume: .38 },
] as const;
export type TrackId = typeof tracks[number]['id'];
