import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sampleManifest } from '../src/config/sampleManifest';
import { makePattern, audible, validatePattern, migratePattern } from '../src/sequencer/Pattern';
import { calculateIntensity } from '../src/visual/VisualIntensity';
import { MotionController } from '../src/visual/MotionController';
import { tracks } from '../src/config/tracks';
import { Transport } from '../src/audio/Transport';
import { SampleBank } from '../src/audio/SampleBank';
import type { AudioEngine } from '../src/audio/AudioEngine';
import type { SequencerStore } from '../src/sequencer/SequencerStore';
import { visualBus } from '../src/visual/VisualEventBus';

test('presets are valid; malformed saved patterns are rejected', () => {
  for (const preset of ['procession', 'moonrise', 'highTide'] as const) assert.ok(validatePattern(makePattern(preset)));
  const custom = makePattern('custom');
  assert.equal(custom.bpm, 90);
  assert.ok(custom.tracks && Object.values(custom.tracks).every(track => track.steps.every(step => step === 0)));
  assert.ok(custom.melody.every(slot => slot === 'rest'));
  assert.ok(validatePattern(custom));
  const pattern = makePattern(); pattern.tracks.jing.steps[0] = NaN;
  assert.equal(validatePattern(pattern), null);
  assert.equal(validatePattern({ bpm: 117, length: 16 }), null);
});
test('mute wins over solo; multiple solos coexist; silent volumes are inaudible', () => {
  const pattern = makePattern();
  pattern.tracks.jing.solo = true; pattern.tracks.yonggo.solo = true;
  assert.equal(audible(pattern, 'jing'), true); assert.equal(audible(pattern, 'nabal'), false);
  pattern.tracks.jing.mute = true; assert.equal(audible(pattern, 'jing'), false);
  assert.equal(audible(pattern, 'yonggo'), true);
  pattern.tracks.yonggo.volume = 0; assert.equal(audible(pattern, 'yonggo'), false);
});
test('density grows with arrangement and respects mutes and active length', () => {
  assert.ok(calculateIntensity(makePattern('highTide')) > calculateIntensity(makePattern('procession')));
  assert.ok(calculateIntensity(makePattern('procession')) > calculateIntensity(makePattern('moonrise')));
  const pattern = makePattern();
  tracks.forEach(({ id }) => pattern.tracks[id].mute = true);
  assert.equal(calculateIntensity(pattern), 0);
  tracks.forEach(({ id }) => { pattern.tracks[id].mute = false; pattern.tracks[id].steps.fill(0); });
  pattern.melody.fill('rest');
  pattern.length = 8;
  pattern.tracks.yonggo.steps[10] = 1;
  assert.equal(calculateIntensity(pattern), 0); pattern.length = 12;
  assert.ok(calculateIntensity(pattern) > 0);
});
test('rapid motion retriggers stay bounded and decay fully without drift', () => {
  const motion = new MotionController();
  for (let i = 0; i < 1000; i++) { motion.trigger('yonggo', 1); motion.update(.001); assert.ok(motion.get('yonggo') <= 1); }
  motion.update(3); assert.equal(motion.get('yonggo'), 0);
});
test('all seven supplied M4A files load through the sample manifest', async (t) => {
  const decoded: number[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    const path = String(url);
    const bytes = await readFile(new URL(`../public${path}`, import.meta.url));
    assert.ok(bytes.toString('ascii', 4, 16).includes('ftypM4A'));
    return new Response(bytes);
  });
  const context = { decodeAudioData: async (bytes: ArrayBuffer) => { decoded.push(bytes.byteLength); return { duration: 90 }; } } as unknown as AudioContext;
  const bank = new SampleBank(); await bank.load(context);
  assert.equal(decoded.length, 7);
  for (const { id } of tracks) {
    assert.equal(bank.status.get(id), 'sample'); assert.ok(bank.get(id));
    assert.ok(sampleManifest[id].start >= 0); assert.ok(sampleManifest[id].gate > 0);
  }
});
test('missing recordings stay silent rather than impersonating supplied instruments', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  t.mock.method(console, 'warn', () => {});
  const bank = new SampleBank(); await bank.load({} as AudioContext);
  for (const { id } of tracks) { assert.equal(bank.status.get(id), 'silent'); assert.equal(bank.get(id), undefined); }
});
test('transport uses audio-clock times, dispatches visuals when due, and cancels on stop', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let frame: FrameRequestCallback = () => {};
  const oldRaf = globalThis.requestAnimationFrame, oldCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = cb => { frame = cb; return 1; }; globalThis.cancelAnimationFrame = () => {};
  const events: number[] = [], hits: number[] = [];
  const off = visualBus.on(e => events.push(e.time));
  const engine = { time: 0, audibleTime: 0, unlock: async () => {}, updateMix: () => {}, trigger: (_id: string, time: number) => hits.push(time), stopAll: () => {} };
  const pattern = makePattern(); pattern.bpm = 120; pattern.melody.fill('rest');
  tracks.forEach(({ id }) => pattern.tracks[id].steps.fill(0)); pattern.tracks.yonggo.steps.fill(1);
  const transport = new Transport(engine as unknown as AudioEngine, { pattern } as SequencerStore);
  try {
    await transport.play(); assert.deepEqual(hits, [.06]); assert.deepEqual(events, []);
    engine.time = .5; t.mock.timers.tick(25); assert.ok(Math.abs(hits[1] - .56) < 1e-10);
    engine.audibleTime = .07; frame(0); assert.deepEqual(events, [.06]);
    engine.time = 3; t.mock.timers.tick(25);
    assert.equal(hits.length, 3); assert.ok(hits[2] >= 3, 'delayed scheduler does not burst stale hits');
    transport.stop(); const count = hits.length; t.mock.timers.tick(1000); assert.equal(hits.length, count); assert.equal(transport.playing, false);
  } finally { transport.stop(); off(); globalThis.requestAnimationFrame = oldRaf; globalThis.cancelAnimationFrame = oldCancel; t.mock.timers.reset(); }
});
test('stop during asynchronous audio initialization cannot start a ghost transport', async () => {
  let unlock!: () => void;
  const engine = { unlock: () => new Promise<void>(r => unlock = r), stopAll: () => {} };
  const oldCancel = globalThis.cancelAnimationFrame; globalThis.cancelAnimationFrame = () => {};
  try {
    const transport = new Transport(engine as unknown as AudioEngine, { pattern: makePattern() } as SequencerStore);
    const playing = transport.play(); transport.stop(); unlock(); await playing;
    assert.equal(transport.playing, false);
  } finally { globalThis.cancelAnimationFrame = oldCancel; }
});

test('6, 8 and 12 beat patterns validate; legacy saves retain 12 beats and remove texture', () => {
  for (const length of [6, 8, 12] as const) {
    const p = makePattern(); p.length = length; assert.ok(validatePattern(p));
  }
  const p = makePattern();
  const legacy = { ...p, length: 32, tracks: Object.fromEntries(tracks.map(({ id }) => [id, { ...p.tracks[id], steps: [...p.tracks[id].steps, ...Array(20).fill(0)] }])) };
  legacy.tracks.texture = { ...p.tracks.yonggo, solo: true, steps: Array(32).fill(1) };
  legacy.tracks.yonggo.mute = true; legacy.tracks.jing.volume = .23;
  assert.equal(validatePattern(legacy), null);
  const migrated = migratePattern(legacy)!;
  assert.equal(migrated.length, 12);
  assert.equal(migrated.tracks.yonggo.mute, true);
  assert.equal(migrated.tracks.jing.volume, .23);
  assert.equal(Object.keys(migrated.tracks).length, 7);
  assert.equal('texture' in migrated.tracks, false);
  assert.deepEqual(migrated.tracks.janggu.steps, p.tracks.janggu.steps);
  assert.equal(migratePattern({ length: 32, tracks: {} }), null);
});
test('each grid cell is one BPM beat and each supported length wraps at the correct beat', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let frame: FrameRequestCallback = () => {};
  const oldRaf = globalThis.requestAnimationFrame, oldCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = cb => { frame = cb; return 1; }; globalThis.cancelAnimationFrame = () => {};
  try {
    for (const length of [6, 8, 12] as const) {
      const p = makePattern(); p.length = length; p.bpm = 120;
      const engine = { time: 0, audibleTime: 0, unlock: async () => {}, updateMix: () => {}, trigger: () => {}, stopAll: () => {} };
      const transport = new Transport(engine as unknown as AudioEngine, { pattern: p } as SequencerStore);
      const seen: number[] = []; transport.onStep = step => seen.push(step);
      await transport.play();
      for (let beat = 0; beat <= length; beat++) {
        engine.time = beat * .5 + .06; engine.audibleTime = engine.time + .00001;
        t.mock.timers.tick(25); frame(0);
      }
      assert.deepEqual(seen, [...Array.from({ length }, (_, i) => i), 0]);
      transport.stop();
    }
  } finally { globalThis.requestAnimationFrame = oldRaf; globalThis.cancelAnimationFrame = oldCancel; t.mock.timers.reset(); }
});

test('bounded recording schedules exactly 24, 32 or 36 beats and stops before an extra hit', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const oldRaf = globalThis.requestAnimationFrame, oldCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  try {
    for (const [length, beats] of [[6,24],[8,32],[12,36]] as const) {
      const pattern = makePattern(); pattern.length = length; pattern.bpm = 120; pattern.melody.fill('rest');
      tracks.forEach(({id}) => pattern.tracks[id].steps.fill(0)); pattern.tracks.yonggo.steps.fill(1);
      const hits: number[] = [];
      const engine = { time: 0, audibleTime: 0, unlock: async () => {}, updateMix: () => {}, trigger: (_id: string, time: number) => hits.push(time), stopAll: () => {} };
      const transport = new Transport(engine as unknown as AudioEngine, { pattern } as SequencerStore);
      await transport.play(beats);
      for (let tick = 1; tick <= (beats * .5 + .1) / .025; tick++) {
        engine.time = tick * .025; t.mock.timers.tick(25);
      }
      assert.equal(hits.length, beats); assert.equal(transport.playing, false);
      assert.ok(hits.every(time => time < .06 + beats * .5)); transport.stop();
    }
  } finally { globalThis.requestAnimationFrame = oldRaf; globalThis.cancelAnimationFrame = oldCancel; t.mock.timers.reset(); }
});
