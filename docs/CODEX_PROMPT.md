# SMFP — Codex 1차 구현 프롬프트

아래 내용을 Codex에 그대로 전달한다.

```text
프로젝트명은 SMFP (SUN MOON FIVE PEAK)다.

먼저 README.md를 끝까지 읽고 assets/reference, assets/concept, 그리고 assets/reference/The_Kings_March_reference.mp3를 확인해라.

중요: 이 프로젝트는 단순한 리듬게임이 아니다.

SMFP는 대취타/궁중음악 계열 국악기 샘플을 현대적인 방식으로 step sequencing하고 layering하면서, 그 음악 이벤트에 맞춰 픽셀 일월오봉도가 실시간으로 움직이는 audiovisual sequencer다.

The_Kings_March_reference.mp3에서 특정 멜로디를 복제하지 말고 다음 ‘구조적 감각’만 참고한다:
- 현대적인 행진 pulse
- 무거운 저역 타악
- 긴 ceremonial horn call
- 공격적인 lead layer
- accent / transition
- section이 진행될수록 쌓이는 density와 build-up
- drop에서 크게 확장되는 에너지

실제 최종 음원은 사용자가 제공할 국립국악원 국악 디지털 음원 샘플이다.

단일 악기 샘플을 임의 피치 시프트하여 실제 궁상각치우나 실제 주법을 재현했다고 가정하지 마라.
현대적인 느낌은 주로 sequencing, repetition, subdivision, velocity, gating, layering, mute/solo, FX, build/drop 구조에서 만들어야 한다.

기술 스택:
- Vite
- TypeScript strict
- Phaser 3
- Web Audio API 기반 sample scheduling
- UI는 가벼운 DOM/CSS 사용 가능

1차 MVP 요구사항:

1. 프로젝트명/타이틀을 SMFP / SUN MOON FIVE PEAK로 표시.
2. 16:9 반응형 픽셀 일월오봉도 메인 Scene.
3. 해, 달, 오봉, 소나무, 폭포, 파도, 구름을 독립 visual layer로 관리.
4. pixelArt=true, antialias=false, 정수 좌표 기반.
5. 실제 sprite가 부족하면 placeholder pixel art를 사용하되 나중에 PNG 교체가 쉬운 asset manifest 구조.
6. Idle motion 구현: 파도 loop, 폭포 loop, 구름 이동, 소나무 미세 흔들림, 해/달 미세 부유.
7. 8 track x 16 step sequencer 구현.
8. 각 track에 step toggle, mute, solo, volume 제공.
9. BPM 70~150, 기본 116~118 중 적절한 값 사용.
10. PLAY / STOP / CLEAR.
11. Transport는 단순 setInterval이 아니라 Web Audio clock을 기준으로 look-ahead scheduling 구조를 사용.
12. audio와 visual을 직접 결합하지 말고 event bus로 분리.
13. 임시 sample 또는 sample이 없을 때 silent fallback을 지원.
14. 우선 track id:
    - yonggo
    - janggu
    - jing
    - jabara
    - nabal
    - nagak
    - taepyeongso
    - texture
15. 각 track trigger마다 대응 visual reaction 실행.
16. 같은 element를 빠르게 연타해도 tween 누적/좌표 drift가 생기지 않는 MotionController 구현.
17. visual reaction 예:
    - yonggo: 중앙 오봉 impact + 아주 약한 screen shake
    - janggu: 파도 rhythmic pulse
    - jing: 달 ring
    - jabara: 해 flash
    - nabal: 오봉 뒤 expanding air wave
    - nagak: 구름/하늘 slow low-frequency pulse
    - taepyeongso: 해/산 능선/하늘에 빠른 lead streak
18. 현재 활성 track 수와 step density를 계산해 VisualIntensity 값을 0~1로 만들 것.
19. VisualIntensity가 높아질수록 파도, 빛, 폭포, 능선 highlight가 점진적으로 강해지도록 할 것.
20. 과도한 strobe나 지속적인 screen shake는 금지.
21. 기본 FX architecture 생성:
    - reverb send
    - delay send
    - filter
    실제 UI는 최소한으로 시작해도 되지만 확장 가능하게 작성.
22. sample start, gate/retrigger를 나중에 지원하기 쉬운 AudioEngine 설계.
23. 데스크톱과 태블릿에서 모두 조작 가능한 크기의 step/button UI.
24. 서버, 로그인, DB, 점수, 랭킹은 만들지 말 것.

디자인 방향:
- 귀엽지만 유아적이지 않은 16-bit pixel art
- 전통 일월오봉도의 대칭성과 상징은 유지
- 화면은 전통 병풍과 현대 공연 비주얼라이저의 중간 느낌
- Ableton처럼 복잡한 DAW UI가 아니라 누구나 바로 만질 수 있는 악기/장난감 같은 시퀀서
- 화려한 설정 메뉴보다 중앙의 움직이는 일월오봉도와 sequencer interaction 완성도를 우선

구조 권장:

src/audio/AudioEngine.ts
src/audio/Transport.ts
src/audio/SampleBank.ts
src/audio/Effects.ts
src/sequencer/SequencerStore.ts
src/sequencer/Pattern.ts
src/visual/VisualEventBus.ts
src/visual/MotionController.ts
src/visual/VisualIntensity.ts
src/game/IntroScene.ts
src/game/SMFPScene.ts
src/config/tracks.ts
src/config/motionPresets.ts
src/config/sampleManifest.ts

진행 방식:
1. 현재 repo를 먼저 검사.
2. README와 모든 reference asset을 확인.
3. 구현 계획을 짧게 세운 뒤 바로 작업.
4. 1차 MVP를 실제 실행 가능하게 끝까지 구현.
5. npm run build 확인.
6. 실행 화면을 확인할 수 있다면 console/layout/timing 문제 수정.
7. 마지막에 구현 내용, 주요 architecture, 교체해야 할 placeholder asset, 다음 단계 TODO를 보고.

가장 중요한 성공 기준:
‘버튼을 눌렀더니 국악기 소리가 난다’가 아니라,
‘내가 패턴을 만들수록 음악의 groove와 화면 속 일월오봉도의 에너지가 함께 살아난다’는 느낌이 나야 한다.
```
