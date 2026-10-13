const mobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
document.documentElement.classList.toggle('mobile-device', mobileDevice);
import { PerformanceRecorder, recordingBeats } from './recording/PerformanceRecorder';
import { runOpeningCeremony } from './opening/OpeningCeremony';
import { mountPalaceBreeze } from './opening/PalaceBreeze';
import { melodyPhrases, phraseBeats, type MelodySlot } from './config/melodyPhrases';
import Phaser from 'phaser';
import './fonts.css';
import './style.css';
import { tracks, type TrackId } from './config/tracks';
import { AudioEngine } from './audio/AudioEngine';
import { Transport } from './audio/Transport';
import { SequencerStore } from './sequencer/SequencerStore';
import { audible, type PresetId } from './sequencer/Pattern';
import { calculateIntensity } from './visual/VisualIntensity';
import { visualBus } from './visual/VisualEventBus';
import { palaceThemes, resolvePalace, type PalaceId } from './config/palaceThemes';
import { SMFPScene } from './game/SMFPScene';
const store = new SequencerStore();
const audio = new AudioEngine();
const transport = new Transport(audio, store);
const recorder = new PerformanceRecorder();
let recordingStarting = false;
const landscape = new SMFPScene();
let selectedPalace: PalaceId = 'gyeongbok';
try { selectedPalace = resolvePalace(localStorage.getItem('smfp-palace-v1')); } catch { /* Optional local preference. */ }
landscape.setPalace(selectedPalace);
let activeStep = -1, starting = false, openingPlayed = false, startRequest = 0;
let restoreClear: number[][] | undefined;
let restoreMelody: MelodySlot[] | undefined;
let selectedPhrase: MelodySlot = 'a';
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const icons = `<img class="brand-glyph" src="/ilwolobong-mark.svg" alt="">`;
$('#app').innerHTML = `
  <section class="opening-screen" id="opening-screen" aria-label="일월오봉 시작 화면">
    <div class="opening-copy">
      <div class="opening-lockup"><span class="opening-mark" aria-hidden="true">${icons}</span><h1>일월오봉</h1></div>
      <p>해, 달, 다섯 봉우리 그리고 대취타</p>
      <button class="opening-start" id="opening-start"><span aria-hidden="true">▶</span> 시작하기</button>
      <a class="opening-contact" href="https://litt.ly/kikeunssam" target="_blank" rel="noopener noreferrer">개발자 문의 ↗</a>
      ${mobileDevice ? '' : '<a class="opening-contact opening-worksheet" href="/worksheets/ilwolobong-daechwita.pdf" download="일월오봉_대취타_학습지.pdf">학습지 다운로드 ↓</a>'}
    </div>
    <div class="opening-bottom"><span>© 2026 키큰쌤. All rights reserved.</span></div>
  </section>
  <main class="shell">
    <header class="masthead"><a class="brand" href="./" aria-label="일월오봉 처음으로">${icons}<span class="brand-copy"><span class="brand-title">일월오봉</span><small class="brand-sub">해, 달, 다섯 봉우리 그리고 대취타</small></span></a>
      <nav class="header-actions" aria-label="도움말과 설명 자료">
        <a class="text-button header-link" href="https://www.gogung.go.kr/gogung/pgm/psgudMng/view.do?psgudSn=363399" target="_blank" rel="noopener noreferrer">일월오봉도란? <span aria-hidden="true">↗</span></a>
        <a class="text-button header-link" href="https://www.gugak.go.kr/ency/topic/view/204" target="_blank" rel="noopener noreferrer">대취타란? <span aria-hidden="true">↗</span></a>
        <button class="text-button" id="help" aria-label="놀이 방법">놀이 방법 <span>↗</span></button>
      </nav>
    </header>
    <section class="section-heading"><div class="palace-picker"><span class="palace-label">어느 궁궐에서 연주할까?</span><div class="palace-options" role="group" aria-label="궁궐별 일월오봉도 선택">${Object.values(palaceThemes).map(theme => `<button class="palace-option" data-palace="${theme.id}" aria-pressed="${theme.id === selectedPalace}" style="--palace-accent:${theme.accent}"><span class="palace-chip" aria-hidden="true"></span><span>${theme.palace}<small>${theme.hall}</small></span></button>`).join('')}</div></div></section>
    <section class="performance" aria-label="소리에 반응하는 일월오봉도">
      <div class="scene-frame">
        <div id="landscape" role="group" aria-label="해와 달, 다섯 봉우리, 소나무, 폭포와 파도가 있는 픽셀 풍경. 폭포를 누르면 장구를 들어요.">
          <button class="waterfall-hit waterfall-left" aria-label="왼쪽 폭포, 장구 소리 듣기" title="눌러서 장구 소리 듣기"></button>
          <button class="waterfall-hit waterfall-right" aria-label="오른쪽 폭포, 장구 소리 듣기" title="눌러서 장구 소리 듣기"></button>
        </div>
      </div>
      <aside class="session-panel"><div class="panel-label">하나 · 분위기 고르기</div><h2>오늘은 어떤<br>장단으로 놀까?</h2><p>마음에 드는 장단을 고르고<br>자유롭게 바꿔 보세요.</p>
        <div class="presets" aria-label="시작 장단">
          <button class="preset selected" data-preset="procession"><span class="preset-icon coral">▥</span><span>왕의 행차<small>힘차고 위엄 있게</small></span><span class="preset-arrow">↗</span></button>
          <button class="preset" data-preset="moonrise"><span class="preset-icon sage">◒</span><span>달빛 연회<small>느긋하고 부드럽게</small></span><span class="preset-arrow">↗</span></button>
          <button class="preset" data-preset="highTide"><span class="preset-icon blue">≋</span><span>축제 행렬<small>신나고 흥겹게</small></span><span class="preset-arrow">↗</span></button>
          <button class="preset custom-preset" data-preset="custom"><span class="preset-icon">＋</span><span>내맘대로<small>빈 장단부터 시작</small></span></button>
        </div>
      </aside>
    </section>
    <section class="instrument" aria-label="장단 만들기">
      <div class="transport-bar"><div class="transport-buttons"><button id="play" class="play" aria-label="장단 재생"><span id="play-icon">▶</span><span id="play-text">재생</span></button><button id="stop" class="stop" aria-label="멈추고 처음으로">■</button><button id="record" class="record-button" aria-label="풍경과 음악 MP4 녹화"><span aria-hidden="true">●</span> 녹화</button></div><div class="record-status" id="record-status" hidden><span id="record-time" role="status"></span><a id="record-download" hidden>다시 저장 ↓</a></div>
        <div class="tempo-block"><label class="tempo"><span>빠르기</span><input id="bpm" type="number" min="70" max="150" step="1" value="${store.pattern.bpm}" aria-label="빠르기, 분당 박 수"><span class="tempo-rule"></span><input id="tempo-range" type="range" min="70" max="150" value="${store.pattern.bpm}" aria-label="빠르기 조절"></label><span class="tempo-hint">한 칸 = 한 박<span class="keyboard-hint"> · Shift + 클릭: 세게 · 숫자 1–7: 소리 듣기</span><span class="mobile-step-hint"> · 꾹 누르기: 강박</span></span></div>
        <div class="transport-right"><span id="position" class="position">01 <span>/ 12</span></span><label class="length-label">박 수<select id="length" aria-label="반복할 박 수"><option value="6">6박</option><option value="8">8박</option><option value="12" selected>12박</option></select></label><button id="clear" class="text-button">비우기</button><button id="undo" class="text-button" hidden>되돌리기</button></div>
      </div>
      <div class="sequencer-scroll"><div class="sequencer-grid"><div class="grid-heading"><span class="track-heading">둘 · 칸을 눌러 장단 만들기</span><div id="step-labels" class="step-labels"></div><span class="mix-heading">소리 조절</span></div><div id="tracks"></div></div></div>
      <section class="melody-workshop" aria-label="태평소 가락 놀이">
        <div class="melody-heading"><h2>태평소 · 가락 잇기</h2><span id="melody-state" aria-live="polite">가락을 골라 세 자리에 놓아 보세요</span></div>
        <div class="phrase-palette" role="group" aria-label="가락 고르기">${Object.entries(melodyPhrases).map(([id, p]) => `<button data-phrase="${id}" aria-pressed="${id === 'a'}" style="--phrase-color:${p.color}">${p.name}<small>${p.duration.toFixed(1)}초</small></button>`).join('')}<button data-phrase="rest" aria-pressed="false">쉼<small>한 바퀴</small></button><button id="phrase-preview">고른 가락 듣기 ▶</button></div>
        <div id="melody-slots" class="melody-slots" role="group" aria-label="가락 순서">${[0,1,2].map(i => `<button data-melody-slot="${i}"></button>`).join('')}</div>
        <p>가락 고르기 → 아래 자리에 놓기 · 가락은 원래 속도로 이어지고 다음 첫 박에 교대해요. 남는 박은 쉬어요.</p>
      </section>
    </section>
    <footer class="credits"><span>© 2026 키큰쌤. All rights reserved.</span><p>악기 샘플은 국립국악원 '국악 디지털 음원' 자료를, 출정 음성은 제공된 녹음을 활용하였습니다.</p></footer>
  </main>
  <div id="toast" role="status" aria-live="polite"></div>
  <dialog id="help-dialog"><button class="dialog-close" aria-label="도움말 닫기">×</button><span class="eyebrow">대취타 장단 놀이터</span><h2>장단을 만들고<br>가락을 이어 보세요!</h2><p>타악기로 장단을 만들고, 태평소 가락을 얹어 나만의 대취타 풍경을 연주해요.</p><ul><li><strong>궁궐과 시작 장단</strong>을 골라 풍경과 연주를 바꿔요. 왕의 행차, 달빛 연회, 축제 행렬에서 하나를 고른 뒤 자유롭게 고쳐 보세요. <strong>내맘대로</strong>는 분당 90박의 빈 장단에서 시작해요.</li><li><strong>6박·8박·12박</strong> 중 반복할 길이를 골라요. 장단 칸 하나가 한 박이에요. 칸을 누르면 켜지고, 다시 누르면 꺼져요. Shift를 누르고 클릭하면 강세를 줘요. 모바일에서는 칸을 꾹 누르면 강박이 돼요.</li><li><strong>대취타 악기</strong>를 함께 배치해 보세요. 용고는 다섯 산을 들썩이고, 장구는 폭포를 깨우며, 징은 달빛을, 자바라는 햇살을, 나각은 소나무를 움직여요. 나발의 울림은 하늘에 빛을 더해요.</li><li><strong>태평소 가락 잇기</strong>: 가락 하나·둘·셋 또는 쉼을 고르고 아래 세 자리에 놓아 순서를 만들어요. 가락이 길면 여러 바퀴 이어진 뒤 다음 가락이 첫 박에서 시작해요. 원래 연주 속도로 들려주며, 남는 박은 쉬어요. 가락을 바꾸면 해당 자리가 다시 시작할 때 적용돼요.</li><li><strong>시작하기</strong>를 누르면 검은 화면에 족자가 펼쳐지고 ‘명금일하 대취타 하랍신다’ 출정 음성과 함께 취타대가 준비돼요. 준비가 끝나면 메인 화면으로 이동해요. <strong>재생 버튼</strong>을 누르면 시작하고, 연주 중 누르면 일시정지해요. 다시 누르면 이어서 연주해요. 네모 버튼은 처음으로 정지해요. 스페이스바도 재생과 일시정지에 사용할 수 있어요.</li><li><strong>악기 이름 또는 숫자 1–7</strong>을 눌러 소리를 미리 들어요. 태평소는 현재 고른 가락을 미리 들어요. 합주 중 태평소 미리듣기를 누르면 합주가 멈춰요.</li><li class="record-help"><strong>녹화</strong>를 누르면 첫 박부터 풍경과 음악을 함께 담아요. 6박은 24박, 8박은 32박, 12박은 36박 뒤에 MP4로 자동 저장해요. 녹화 정지를 누르면 그때까지 저장해요. 녹화 중에도 장단 칸을 누르거나 Shift + 클릭으로 강세를 바꿀 수 있어요. 바꾼 장단은 이어지는 연주와 영상에 반영돼요. 빠르기와 박 수 등 나머지 설정은 고정돼요.</li><li><strong>쉼·독주·음량</strong>으로 악기 구성을 다듬어요. 비우기는 장단과 가락 자리를 지우며, 되돌리기로 복구할 수 있어요. 궁궐 풍경과 연주 설정은 이 기기에 저장돼요.</li></ul><p class="help-note">태평소 가락은 제공된 대취타 연주 녹음에서 고른 세 구간이에요. 가락 내부 음은 박자에 맞춰 늘이거나 줄이지 않고, 시작과 끝을 보존해 재생해요.</p><button class="play dialog-done">좋아, 연주 시작! ▶</button></dialog>`;

const openingScreen = $('#opening-screen');
const stopPalaceBreeze = mountPalaceBreeze(openingScreen);
if (import.meta.hot) import.meta.hot.dispose(stopPalaceBreeze);
let entering = false;
$('#opening-start').addEventListener('click', async () => {
  if (entering) return;
  entering = true;
  $('#opening-start').setAttribute('disabled', '');
  stopPalaceBreeze();
  await runOpeningCeremony(openingScreen, audio);
  openingScreen.classList.add('leaving');
  document.querySelector<HTMLElement>('.shell')!.classList.add('app-ready');
  window.setTimeout(() => { openingScreen.hidden = true; $('#play').focus(); }, 650);
});

await document.fonts.load('16px Galmuri11').catch(() => []);
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'landscape', width: 640, height: 360,
  backgroundColor: '#142b36', pixelArt: true, roundPixels: true,
  render: { antialias: false, antialiasGL: false, preserveDrawingBuffer: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 640, height: 360 },
  scene: [landscape], audio: { noAudio: true },
});
function selectPalace(id: PalaceId) {
  selectedPalace = id;
  landscape.setPalace(id);
  const theme = palaceThemes[id];
  document.querySelectorAll<HTMLButtonElement>('[data-palace]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.palace === id)));
  $('#landscape').setAttribute('aria-label', `${theme.palace} ${theme.hall}에서 영감을 받은 픽셀 일월오봉도. ${theme.description}.`);
  $('.scene-frame').style.setProperty('--palace-frame', theme.accent);
  try { localStorage.setItem('smfp-palace-v1', id); } catch { /* Switching still works without storage. */ }
}
document.querySelectorAll<HTMLButtonElement>('[data-palace]').forEach(button => {
  const theme = palaceThemes[button.dataset.palace as PalaceId];
  button.title = theme.description;
  button.addEventListener('click', () => selectPalace(theme.id));
});
selectPalace(selectedPalace);
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800); }
function markCustom() { document.querySelectorAll('.preset').forEach(el => el.classList.remove('selected')); }
function renderGrid() {
  const length = store.pattern.length;
  const group = length === 8 ? 4 : 3;
  $('.sequencer-grid').style.setProperty('--steps', String(length));
  $('.sequencer-grid').style.minWidth = `${length * 36 + 393}px`;
  $('#step-labels').innerHTML = Array.from({ length }, (_, i) => `<span class="${i % group === 0 ? 'beat-number' : ''}">${String(i + 1).padStart(2, '0')}</span>`).join('');
  $('#tracks').innerHTML = tracks.map((track, index) => `<div class="track-row" data-track="${track.id}" style="--track-color:${track.color}">
    <button class="track-name" data-preview="${track.id}" aria-label="${track.name} 소리 듣기"><span class="track-index">${index + 1}</span><span class="track-dot" aria-hidden="true"><img src="/instruments/${track.id}.svg" alt="" width="48" height="48"></span><span>${track.name}<small>${track.role}</small></span></button>
    <div class="steps" role="group" aria-label="${track.name} 장단">${track.id === 'taepyeongso' ? '<span class="melody-row-hint">↓ 아래에서 가락을 이어 보세요</span>' : Array.from({ length }, (_, step) => `<button class="step ${step % group === 0 ? 'beat-start' : ''}" data-step="${step}" data-track="${track.id}" aria-label="${track.name}, ${step + 1}박" aria-pressed="false"><span></span></button>`).join('')}</div>
    <div class="track-mix"><button class="mute mix-button" data-action="mute" data-track="${track.id}" aria-label="${track.name} 쉬기" aria-pressed="false">쉼</button><button class="solo mix-button" data-action="solo" data-track="${track.id}" aria-label="${track.name} 독주" aria-pressed="false">독주</button><input class="volume" type="range" data-volume="${track.id}" aria-label="${track.name} 음량" min="0" max="1" step=".01"></div></div>`).join('');
  sync();
}
function sync() {
  const pattern = store.pattern;
  tracks.forEach(({ id, name }) => {
    const state = pattern.tracks[id], row = $(`[data-track="${id}"].track-row`);
    row.classList.toggle('muted', !audible(pattern, id));
    row.querySelectorAll<HTMLButtonElement>('.step').forEach(button => {
      const velocity = state.steps[Number(button.dataset.step)], on = velocity > 0;
      button.classList.toggle('on', on); button.classList.toggle('accent', velocity === 1);
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', `${name}, ${Number(button.dataset.step) + 1}박, ${on ? velocity === 1 ? '세게' : '켜짐' : '꺼짐'}`);
    });
    row.querySelector('.mute')!.setAttribute('aria-pressed', String(state.mute));
    row.querySelector('.solo')!.setAttribute('aria-pressed', String(state.solo));
    row.querySelector<HTMLInputElement>('.volume')!.value = String(state.volume);
  });
  $<HTMLInputElement>('#bpm').value = String(pattern.bpm);
  $<HTMLInputElement>('#tempo-range').value = String(pattern.bpm);
  $<HTMLSelectElement>('#length').value = String(pattern.length);
  document.querySelectorAll<HTMLButtonElement>('[data-melody-slot]').forEach(button => {
    const i = Number(button.dataset.melodySlot), slot = pattern.melody[i];
    const beats = phraseBeats(slot, pattern.bpm, pattern.length);
    button.innerHTML = `<span>${i + 1} · ${slot === 'rest' ? '쉼' : melodyPhrases[slot].name}</span><small>${beats / pattern.length}바퀴 · ${beats}박</small>`;
    button.style.setProperty('--phrase-color', slot === 'rest' ? '#b8b6a0' : melodyPhrases[slot].color);
    button.setAttribute('aria-label', `${i + 1}번 자리, ${slot === 'rest' ? '쉼' : melodyPhrases[slot].name}, ${beats}박`);
  });
  audio.updateMix(pattern);
  if (!audible(pattern, 'taepyeongso')) window.dispatchEvent(new Event('smfp:melody-stop'));
  updateEnergy();
  setStep(activeStep);
}
function updateEnergy() {
  const intensity = calculateIntensity(store.pattern);
  landscape.intensityTarget = transport.playing ? intensity : 0;
}
function setRecordMessage(message: string) {
  $('#record-status').hidden = message.length === 0;
  $('#record-time').textContent = message;
}
function setStep(step: number) {
  activeStep = step;
  document.querySelectorAll<HTMLElement>('.step').forEach(el => el.classList.toggle('current', Number(el.dataset.step) === step));
  document.querySelectorAll('#step-labels span').forEach((el, i) => el.classList.toggle('current', step === i));
  $('#position').innerHTML = `${String(Math.max(0, step) + 1).padStart(2, '0')} <span>/ ${store.pattern.length}</span>`;
}
async function play() {
  if (recordingStarting) return;
  if (starting || !openingScreen.hidden) return;
  if (transport.playing) { transport.pause(); return; }
  const request = ++startRequest;
  starting = true;
  $('#play-icon').textContent = '…'; $('#play-text').textContent = '재생 준비';
  $('#play').setAttribute('aria-label', '재생 준비 중');
  $('#play').setAttribute('aria-busy', 'true');
  try {
    await audio.unlock();
    if (request !== startRequest) return;
    if (!openingPlayed) {
      openingPlayed = true;
      landscape.startPerformance();
    }
    await transport.play();
  } catch (error) { console.error(error); toast('소리를 시작하지 못했어요. 재생을 다시 눌러 주세요.'); }
  finally {
    if (request === startRequest) {
      starting = false;
      $('#play').removeAttribute('aria-busy');
      updateTransport();
    }
  }
}
function updateTransport() {
  if (recorder.active && !transport.playing) { recorder.stop(); setRecordMessage('MP4 저장 중…'); setRecordingControls(true); }
  $('#play-icon').textContent = transport.playing ? 'Ⅱ' : '▶';
  $('#play-text').textContent = transport.playing ? '일시정지' : transport.paused ? '이어서 재생' : '재생';
  $('#play').setAttribute('aria-label', transport.playing ? '장단 일시정지' : transport.paused ? '장단 이어서 재생' : '장단 재생');
  $('#play').classList.toggle('is-playing', transport.playing);
  updateEnergy();
}
async function preview(id: TrackId) {
  if (recorder.active || recordingStarting) return;
  try {
    await audio.unlock(); audio.updateMix(store.pattern);
    const phrase = id === 'taepyeongso' && selectedPhrase !== 'rest' ? melodyPhrases[selectedPhrase] : undefined;
    if (id === 'taepyeongso' && !phrase) return;
    if (id === 'taepyeongso' && transport.playing) { transport.stop(); toast('고른 가락을 듣기 위해 합주를 멈췄어요.'); }
    audio.trigger(id, audio.time + .005, { velocity: .9 * store.pattern.tracks[id].volume, preview: true, ...(phrase ? { start: phrase.start, gate: phrase.duration } : {}) });
    visualBus.emit({ track: id, velocity: .9, time: audio.time, step: -1, duration: phrase?.duration, phrase: selectedPhrase });
  } catch { toast('소리를 시작하지 못했어요. 재생을 다시 눌러 주세요.'); }
}
transport.onLength = renderGrid;
transport.onMelody = slot => {
  document.querySelectorAll<HTMLElement>('[data-melody-slot]').forEach((el, i) => el.classList.toggle('playing', i === slot));
  $('#melody-state').textContent = slot < 0 ? '가락을 골라 세 자리에 놓아 보세요' : `${slot + 1}번 자리 연주 중 · 다음 첫 박에서 이어져요`;
};
document.querySelectorAll<HTMLButtonElement>('[data-phrase]').forEach(button => button.addEventListener('click', () => {
  selectedPhrase = button.dataset.phrase as MelodySlot;
  document.querySelectorAll<HTMLElement>('[data-phrase]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
}));
$('#phrase-preview').addEventListener('click', () => { if (selectedPhrase === 'rest') toast('쉼은 한 바퀴 동안 소리를 쉬어요.'); else void preview('taepyeongso'); });
$('#melody-slots').addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-melody-slot]'); if (!button) return;
  store.pattern.melody[Number(button.dataset.melodySlot)] = selectedPhrase; store.change(); markCustom();
  if (transport.playing) toast('가락 변경은 그 자리가 다시 시작할 때 들려요.');
});
transport.onStep = setStep; transport.onState = updateTransport;
store.subscribe(sync);
renderGrid();
function setRecordingControls(locked: boolean) {
  document.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('.instrument button, .instrument input, .instrument select, .preset, .palace-option').forEach(el => {
    if (el.id !== 'record' && el.id !== 'stop') {
      // Rhythm edits affect upcoming scheduled beats without changing the recording limit.
      el.disabled = locked && !(recorder.active && el.matches('.step'));
    }
  });
  $<HTMLButtonElement>('#record').disabled = recorder.saving || recordingStarting;
  $<HTMLButtonElement>('#stop').disabled = recordingStarting;
  $('#record').setAttribute('aria-label', recorder.active ? '녹화 정지하고 MP4 저장' : '풍경과 음악 MP4 녹화');
  $('#record').classList.toggle('recording', recorder.active);
  $('#record').innerHTML = recorder.active ? '■ 녹화 정지' : '<span aria-hidden="true">●</span> 녹화';
}
recorder.onTime = seconds => {
  const minutes = Math.floor(seconds / 60), rest = Math.floor(seconds % 60);
  setRecordMessage(`● ${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')} / ${recordingBeats(store.pattern.length)}박`);
};
recorder.onSaved = (url, filename) => {
  setRecordingControls(false);
  setRecordMessage('MP4 저장 완료');
  const link = $<HTMLAnchorElement>('#record-download'); link.href = url; link.download = filename; link.hidden = false;
  toast('풍경과 음악을 MP4로 저장했어요.');
};
recorder.onError = message => { setRecordingControls(false); toast(message); };
$('#record').addEventListener('click', async () => {
  if (mobileDevice) return;
  if (recorder.active) { transport.stop(); return; }
  if (recordingStarting || recorder.saving) return;
  if (!PerformanceRecorder.mimeType()) { toast('이 브라우저는 MP4 녹화를 지원하지 않아요. 최신 Chrome 또는 Safari에서 열어 주세요.'); return; }
  recordingStarting = true; setRecordingControls(true);
  setRecordMessage('녹화 준비 중…');
  try {
    transport.stop();
    await audio.unlock();
    const canvas = document.querySelector<HTMLCanvasElement>('#landscape canvas');
    if (!canvas || !audio.recordingStream) throw new Error('녹화 화면을 준비하지 못했어요. 다시 눌러 주세요.');
    recorder.start(canvas, audio.recordingStream, () => audio.time);
    if (!openingPlayed) { openingPlayed = true; landscape.startPerformance(); }
    await transport.play(recordingBeats(store.pattern.length));
    $('#record-download').hidden = true;
  } catch (error) {
    recorder.stop();
    toast(error instanceof Error ? error.message : '녹화를 시작하지 못했어요.');
    setRecordMessage('녹화 준비 실패');
  } finally { recordingStarting = false; setRecordingControls(recorder.active || recorder.saving); }
});
$('#play').addEventListener('click', () => void play());
$('#stop').addEventListener('click', () => { startRequest++; starting = false; audio.stopAnnouncement(); transport.stop(); updateTransport(); });
const longPressedSteps = new WeakSet<HTMLButtonElement>();
let holdTimer: ReturnType<typeof setTimeout> | undefined;
let holdPointerId: number | undefined;
let holdButton: HTMLButtonElement | undefined;
$('#tracks').addEventListener('pointerdown', event => {
  if (!mobileDevice || event.pointerType === 'mouse') return;
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.step');
  if (!button || button.disabled) return;
  clearTimeout(holdTimer);
  holdPointerId = event.pointerId; holdButton = button;
  holdTimer = setTimeout(() => {
    if (!holdButton?.isConnected || holdPointerId !== event.pointerId) return;
    const id = holdButton.dataset.track as TrackId, step = Number(holdButton.dataset.step);
    store.toggle(id, step, true); markCustom();
    longPressedSteps.add(holdButton);
    // Stop pointer-generated click from applying a second, normal-strength edit.
    holdButton.dataset.longPressed = 'true';
    if (navigator.vibrate) navigator.vibrate(12);
    holdTimer = undefined;
  }, 450);
});
const cancelStepHold = (event: PointerEvent) => {
  if (event.pointerId !== holdPointerId) return;
  clearTimeout(holdTimer); holdTimer = undefined; holdPointerId = undefined; holdButton = undefined;
};
$('#tracks').addEventListener('pointerup', cancelStepHold);
$('#tracks').addEventListener('pointercancel', cancelStepHold);
$('#tracks').addEventListener('contextmenu', event => {
  if (mobileDevice && (event.target as HTMLElement).closest('.step')) event.preventDefault();
});
$('#tracks').addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button'); if (!button) return;
  if (button.matches('.step') && longPressedSteps.has(button)) {
    longPressedSteps.delete(button); delete button.dataset.longPressed; event.preventDefault(); return;
  }
  const id = button.dataset.track as TrackId;
  if (button.dataset.step !== undefined) { store.toggle(id, Number(button.dataset.step), (event as MouseEvent).shiftKey); markCustom(); }
  if (button.dataset.action) { const key = button.dataset.action as 'mute' | 'solo'; store.pattern.tracks[id][key] = !store.pattern.tracks[id][key]; store.change(); markCustom(); }
  if (button.dataset.preview) void preview(button.dataset.preview as TrackId);
});
$('#landscape').addEventListener('click', event => {
  if ((event.target as HTMLElement).closest('.waterfall-hit')) void preview('janggu');
});
$('#tracks').addEventListener('input', event => { const input = event.target as HTMLInputElement; if (input.dataset.volume) { store.pattern.tracks[input.dataset.volume as TrackId].volume = Number(input.value); store.change(); } });
function changeTempo(value: string) { const num = Number(value); if (!Number.isFinite(num)) return; store.pattern.bpm = Math.max(70, Math.min(150, Math.round(num))); store.change(); }
$('#bpm').addEventListener('input', event => { const value = (event.target as HTMLInputElement).value; if (Number(value) >= 70 && Number(value) <= 150) changeTempo(value); });
$('#bpm').addEventListener('change', event => changeTempo((event.target as HTMLInputElement).value));
$('#tempo-range').addEventListener('input', event => changeTempo((event.target as HTMLInputElement).value));
$('#length').addEventListener('change', event => { const length = Number((event.target as HTMLSelectElement).value) as 6 | 8 | 12; if (transport.playing) { transport.pendingLength = length; toast(`${length}박으로 변경 예약 · 현재 가락 자리 뒤에 적용해요.`); } else { store.pattern.length = length; renderGrid(); store.change(); } markCustom(); });
$('#clear').addEventListener('click', () => { restoreMelody = [...store.pattern.melody]; restoreClear = tracks.map(({ id }) => [...store.pattern.tracks[id].steps]); transport.stop(); store.clear(); $('#undo').hidden = false; markCustom(); toast('장단을 비웠어요. 되돌리기를 누르면 돌아와요.'); });
$('#undo').addEventListener('click', () => { if (!restoreClear) return; if (restoreMelody) store.pattern.melody = restoreMelody; tracks.forEach(({ id }, i) => store.pattern.tracks[id].steps = restoreClear![i]); restoreClear = undefined; $('#undo').hidden = true; store.change(); });
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(button => button.addEventListener('click', () => {
  const wasPlaying = transport.playing; transport.stop();
  store.load(button.dataset.preset as PresetId); renderGrid();
  restoreClear = undefined; $('#undo').hidden = true;
  markCustom(); button.classList.add('selected');
  toast(`${button.querySelector('span:nth-child(2)')!.firstChild!.textContent} 장단을 불러왔어요.`);
  if (wasPlaying) void play();
}));
const dialog = $<HTMLDialogElement>('#help-dialog');
$('#help').addEventListener('click', () => dialog.showModal());
dialog.querySelectorAll('button').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
window.addEventListener('smfp:preview', event => void preview((event as CustomEvent<TrackId>).detail));
window.addEventListener('keydown', event => {
  if (!openingScreen.hidden) return;
  if (dialog.open || event.repeat || event.ctrlKey || event.metaKey || event.altKey || (event.target as HTMLElement).matches('input, select, textarea, button, a')) return;
  if (event.code === 'Space') { event.preventDefault(); void play(); }
  const track = tracks.find(t => t.key === event.key); if (track) void preview(track.id);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && (transport.playing || starting)) { startRequest++; audio.stopAnnouncement(); transport.stop(); starting = false; toast('다른 화면으로 이동해서 연주를 멈췄어요.'); } });
window.addEventListener('pagehide', () => { startRequest++; audio.stopAnnouncement(); transport.stop(); game.destroy(true); });
// A saved edit should not imply it is still the unmodified starter preset.
try { if ((localStorage.getItem('smfp-pattern-v4') ?? localStorage.getItem('smfp-pattern-v3') ?? localStorage.getItem('smfp-pattern-v2') ?? localStorage.getItem('smfp-pattern-v1'))) markCustom(); } catch { /* Storage is optional. */ }

// A phone call or audio-route change can suspend audio without hiding the page.
audio.onInterrupted = () => { if (transport.playing) transport.pause(); };
