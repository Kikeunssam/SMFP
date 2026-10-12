# SMFP MVP implementation handoff

Completed 2026-10-11. Built from the supplied README and CODEX_PROMPT. OPUS_REVIEW_PROMPT was read and preserved but its review workflow was not executed.

## Implemented

- Vite, strict TypeScript, Phaser 3, native Web Audio; lightweight DOM/CSS interface.
- SMFP identity, title overlay and responsive 16:9 procedural pixel landscape.
- Independent sun, moon, five peaks, pines, waterfall, wave, cloud, sky, air and lead layers.
- Idle animation, bounded per-track hit envelopes, reduced motion, smoothed density-driven water/light/ridge energy.
- Eight tracks, 16 default steps, optional 8/32 lengths, two-step accent editing, per-track volume/mute/solo, 70–150 BPM, play/stop/clear with clear undo.
- Three starter arrangements, keyboard/manual previews, interactive scene regions, local pattern and mix persistence.
- Web Audio look-ahead scheduling, queued visual events using output timestamps, fade envelopes, bounded voice overlap, background-tab stop and async-start cancellation.
- Reverb and tempo-linked delay sends, low-pass tone control, master compression.
- Replaceable sample and visual asset manifests. Synth demo buffers and configurable silent fallback.

## New files

The initial workspace was empty. All application files are new:

- `package.json`, `package-lock.json`, `tsconfig.json`, `index.html`, `.gitignore` — runnable project and dependencies.
- `src/main.ts`, `src/style.css` — app composition, responsive UI, controls and input handling.
- `src/audio/{AudioEngine,Transport,SampleBank,Effects}.ts` — scheduling, playback, decoding/fallback and FX.
- `src/sequencer/{Pattern,SequencerStore}.ts` — presets, validation, mix state and persistence.
- `src/visual/{VisualEventBus,MotionController,VisualIntensity}.ts` — decoupled reactions and energy.
- `src/game/SMFPScene.ts` — static first frame, animated royal scroll, and layered landscape.
- `src/config/{tracks,motionPresets,sampleManifest,assetManifest}.ts` — replaceable configuration.
- `tests/core.test.ts` — seven core tests.
- `README.md`, `public/samples/README.md`, `docs/IMPLEMENTATION.md` — operation and handoff notes.
- `docs/PROJECT_BRIEF.md`, `docs/CODEX_PROMPT.md`, `docs/OPUS_REVIEW_PROMPT.md` — preserved source documents.
- `docs/desktop-preview.jpg`, `docs/tablet-preview.jpg` — browser verification screenshots.
- `dist/` — generated production build, intentionally ignored along with dependencies.

## Verification

- `npm run build`: strict TypeScript and production bundle passed.
- `npm test`: 7/7 passed. Covers persisted-pattern validation, mute/solo/volume eligibility, density and active length, repeated-motion bounds, finite/audible bounded demo buffers, clock scheduling and delayed callback recovery, cancellation while audio unlock is pending.
- Dev server started successfully at `http://127.0.0.1:5173/`; HTTP 200 checked.
- In-app browser: play/stop and advancing playhead, step toggle/accent, mute, solo, presets including replacement during playback, 8/16/32 lengths, tempo change and reload persistence, volume/FX inputs, clear/undo, help and gentle-motion controls checked.
- Desktop 1280 × 900 and tablet 768 × 1024 viewports inspected; long patterns scroll within their panel. No outer horizontal overflow observed at the tablet size. Responsive override reset after testing.
- Browser console showed no errors or warnings during these checks.
- Fixed during validation: nullable audio output timestamp typing, over-full-scale synthetic drum peak, and immediate tempo persistence.

## Limitations and next iteration

1. Supply licensed National Gugak Center samples and verify their instrument/technique labels, attribution and usage rights. Tune sample starts, gates, channel gains and FX by listening to those recordings. Current sounds are deliberately identified as synthesized placeholders.
2. Supply reference/concept assets if closer art direction is desired. No named reference PNGs or MP3 were available; this version follows the written design. Procedural art is original and replaceable. Full-canvas PNG replacement alone does not add production sprite animation; define anchors/animation frames as part of that art pass.
3. Test audio latency and subjective groove on actual iPad/Safari, Android tablets, wired audio and Bluetooth. Browser playback and deterministic scheduling logic were checked, but acoustic output-to-display latency was not measured.
4. Add per-step sample/gate/retrigger controls and sample variants. No pitch-shifted scale or generated technique is claimed.
5. Consider pattern export/import, bank switching and deliberate build/drop transitions in the next product iteration. Preset selection currently replaces the active pattern immediately; clear has one-level step undo.
6. Vite reports a large JavaScript chunk (about 1.24 MB, 345 kB gzip), primarily Phaser. The build succeeds; a renderer-specific bundle or lazy scene loading can improve initial loading for a hosted release.
7. Live edits can take up to the 100 ms scheduling horizon to affect an already queued hit. Output timing uses `getOutputTimestamp` when available, with the audio clock as fallback. Stop releases sample voices quickly; short FX tails decay naturally.
8. Preserved Opus review prompt is ready for the next review stage. No hosted deployment, account, database, scoring or AI generation was added.

## 한국어·픽셀 게임 화면 개편 (2026-10-11)

이 절과 현재 README가 위 초기 MVP 기록보다 우선합니다.

- 사용자 화면·악기·도움말·접근성 이름·알림을 한국어로 바꿨습니다. SMFP 브랜드명과 키보드 Shift 표기는 유지합니다.
- 8/16/32 스텝 대신 8/12/16박을 지원합니다. 한 칸은 한 박이며 예약 간격은 60/BPM초입니다. 새 시작 리듬도 이 박 길이에 맞춰 조정했습니다.
- 현재 패턴은 16칸을 저장합니다. 8·12박에서는 뒤의 칸을 숨겨 보존합니다. 기존 32칸 저장은 앞 16칸을 유지하며 변환하고, 원본 v1 키는 삭제하지 않습니다.
- 제공한 두 이미지의 웃는 달·해, 겹친 산, 소나무, 흰 폭포와 파도, 구름을 참고해 독립된 실시간 픽셀 그래픽으로 다시 그렸습니다. 실제 이미지 파일은 assets/reference에 보관합니다.
- 남색·금색 프레임, 입체 픽셀 버튼, 칸으로 채워지는 에너지 게이지, 픽셀 슬라이더, 별 무늬 배경, 앱에 포함된 Galmuri 글꼴을 적용했습니다.
- main.ts / style.css / fonts.css / game / tracks / Pattern / SequencerStore / Transport / index.html / vite.config.ts / package.json 및 lockfile / 테스트 / README를 변경했습니다.
- 현재 테스트는 9개입니다. 기존 기능에 저장 변환과 각 박 수의 정확한 반복 검사를 추가했습니다.
- 브라우저에서 8박 64칸, 12박 96칸, 16박 128칸, 재생·정지·편집·쉼·독주, 12박 저장 후 새로고침, 한글 도움말을 확인했습니다. 데스크톱 1280×900 / 태블릿 768×1024에서 화면을 확인했고 콘솔 오류는 없었습니다.
- 최신 검증 이미지는 pixel-ko-desktop.jpg와 pixel-ko-tablet.jpg입니다. 이전 스크린샷은 초기 MVP 기록입니다.

## 궁궐별 콘셉트 선택 (2026-10-12)

- 제목 옆에 세 궁궐/정전 이름의 선택 버튼 추가. 키보드 조작과 aria-pressed 선택 상태, 반응형 배치 제공.
- palaceThemes.ts에 궁궐별 팔레트, 5개 봉우리의 위치·높이·폭, 능선 함수, 소나무 형태, 파도 높이·주기·물보라 설정 분리.
- SMFPScene.setPalace는 기존 레이어를 다시 그리며 중앙 산과 바위 그래픽 객체를 재사용. 오디오 Transport와 패턴 Store에는 변경을 가하지 않음.
- 사용자 사진 세 장을 assets/reference에 원본 그대로 보관. 복원이 아닌 사진 기반 픽셀 해석임.
- 연주 중 세 테마 전환, 패턴 보존, 선택 후 새로고침, 768px 화면 내 버튼 배치, 브라우저 콘솔 오류 없음 확인. 기존 9개 테스트 통과.
- 검증 이미지: palace-gyeongbok.jpg / palace-changdeok.jpg / palace-deoksu.jpg.

## 실제 음원·7개 트랙·일월오봉 명칭 (2026-10-12)

- WAV 7개를 macOS AAC 인코더로 128kbps M4A 변환. 원본은 변경하지 않음. 전체 파일 길이는 보존하고 manifest의 offset/gate로 앞 무음 및 리듬용 발음 구간 제어. 태평소는 전체 82.57초 파일의 첫 발음 구간 재생.
- SampleBank에서 7개 실제 M4A 로드. 실패 시 무음 처리. UI에 실제 로드 개수 표시. 나발·나각·태평소 동시 발음 1개, 징·자바라 2개 제한.
- 물결 트랙 삭제. 6·8·12박과 키보드 1–7 지원. 저장은 v3이며 v1/v2에서 앞 12칸 및 7개 악기 믹스를 보존하고 물결 데이터 제거.
- 자바라: 큰 방사형 픽셀 광선, 0.65초 감쇠. 용고: 다섯 산 부모 레이어를 함께 최대 7px 이동. 나각: 양쪽 소나무 최대 9px 들썩임. 파도: 타격/밀도 영향 및 물결 영역의 미리듣기 클릭 제거, 고정 속도 idle만 유지. 장구 반응은 폭포로 연결.
- 로고·제목·브라우저 제목은 일월오봉. 하단은 요청한 © 2026 키큰쌤. All rights reserved. 및 국립국악원 음원 출처 두 문구만 표시.
- 빌드 및 10개 테스트 통과. 브라우저에서 실제 M4A 디코딩 7/7, 7개 트랙, 6박 표시, 출처 문구와 나각 미리듣기 확인. 콘솔 오류 없음.

## 2026-10-12 · 태평소 가락 놀이
- New recording: `태평소 연주곡 대취타 wave.wav` (62.893 s), converted to `public/samples/taepyeongso-performance.m4a` (~796 KiB). Original scale M4A remains available for a future note editor.
- Three provisional breath-gap excerpts: A 40.20–43.94 s, B 56.72–61.14 s, C 22.04–28.94 s. Boundaries selected using RMS quiet gaps, not audition-certified musicological phrases. Next iteration: listen and refine attack/tail boundaries and musical compatibility.
- Three arrangement slots accept A/B/C/rest. A clip reserves enough whole 6/8/12-beat cycles to finish at its native rate, then waits for the next downbeat; rest occupies one cycle. No pitch shift or time stretch. Internal notes are NOT quantized to percussion. Scheduler guards the actual clip end even if tempo accelerates.
- During playback, meter changes wait for the next phrase slot boundary. Stop applies pending meter immediately. Edits affect a slot's next start. Preview stops the arrangement to avoid clipping active phrases.
- v4 storage preserves percussion/mix and gives older saves a default phrase arrangement; old single-note taepyeongso cells are retained in data but no longer scheduled. Clear/undo includes melody slots.
- Phaser sky trail advances through the phrase; brightness uses a 20 Hz RMS envelope from the actual excerpt. Clouds sway gently; reduced-motion mode fixes the trail position and disables cloud sway. Mute/stop clear the melody visual.
- Main changes: `melodyPhrases.ts`, `melodyDynamics.ts`, `Pattern.ts`, `SequencerStore.ts`, `Transport.ts`, `main.ts`, `SMFPScene.ts`, `VisualIntensity.ts`, `style.css`. Reproduction script: `scripts/prepare_melody.py`.
- Validation: build passed (existing bundle-size advisory), 13 tests passed including whole-cycle allocation across 70–150 BPM, no phrase overlap, rests, deferred meter changes, migration. Browser decoded 7/7 samples and preview ran with no console errors. Screenshot: `ilwolobong-melody.jpg`.


## 2026-10-12 · 첫 재생 출정 왕명 연출
- Copied the user-provided 8.23s M4A to `public/samples/daechwita-announcement.m4a` unchanged.
- The landscape is frozen before first playback; sun and moon eyes remain closed. Removed the old IntroScene prompt overlay.
- On first Play: once audio unlock/load completes, an original procedural pixel scroll unfurls with ‘명금일하 대취타 하랍신다.’ while the announcement plays. It folds away after the voice ends, then transport begins at beat 1. Pause/resume does not replay the cue. Stop cancels a cue in progress. If cue load fails, the app skips the banner and starts the music with a notice.
- Voice effect: 1.3 playback rate for a pronounced high-tone lift; gentle 120 Hz high-pass and 6.8 kHz low-pass to reduce rumble and hiss; subtle 2.1 kHz presence lift. Pitch wobble and echo were removed to keep the cue clear. Original source is untouched.
- Before the first Play cue, instrument previews stay audio-only and the landscape remains frozen. Verified by comparing the browser scene before and after a waterfall preview click.
- Added attribution distinction: seven instrument samples use National Gugak Center recordings; the announcement is user-provided.
- Validation: `npm run build`; 13 tests pass. Browser check confirmed static first frame, cue and open scroll, then automatic music start after the announcement, no console errors. Screenshots: `ilwolobong-intro-static.jpg` and `ilwolobong-decree-open.jpg`.

## 2026-10-12 · 내맘대로 시작과 장구 반응
- Added an empty 내맘대로 pattern at 90 BPM, with all percussion cells off and all melody slots resting.
- Moved the one-cell-per-beat, Shift-accent, and keyboard-preview guide directly below the tempo control in a compact pixel-edged strip. Removed the standalone sound-customization section and its help text.
- Instrument previews now bypass mute/solo channel gating while respecting the selected track volume, so clicking 장구 소리 듣기 still plays a preview when the sequencer mix is muted or soloed.
- Both waterfall drawings now have visible, accessible click targets that preview janggu. Janggu hits widen and brighten the falling streams and raise a broad foam/spray burst; the pulse lasts long enough to read clearly. The frozen first-play scene stays static until an instrument preview or first playback.
- Validation: build passes, all 13 tests pass, and browser check confirmed the waterfall buttons and the larger splash response.

## 2026-10-12 · 첫 재생 전 풍경 정지와 왕명 음성 음정
- Instrument previews before the first Play cue now produce sound only. No visual events advance the landscape until the scroll cue ends and performance begins.
- Raised the opening voice playback rate from 1.12 to 1.3 for a more obvious high-pitched character; source audio remains unchanged.
