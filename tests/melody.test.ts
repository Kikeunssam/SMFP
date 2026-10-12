import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phraseBeats, melodyPhrases } from '../src/config/melodyPhrases';
import { makePattern, migratePattern, validatePattern } from '../src/sequencer/Pattern';
import { Transport } from '../src/audio/Transport';
import type { AudioEngine } from '../src/audio/AudioEngine';
import type { SequencerStore } from '../src/sequencer/SequencerStore';

test('all phrases fit their reserved whole cycles at every allowed tempo and meter', () => {
  for (const length of [6, 8, 12]) for (let bpm = 70; bpm <= 150; bpm++) {
    for (const id of ['a','b','c'] as const) {
      const beats = phraseBeats(id,bpm,length);
      assert.equal(beats % length,0);
      assert.ok(beats * 60 / bpm >= melodyPhrases[id].duration + .04);
    }
    assert.equal(phraseBeats('rest',bpm,length),length);
  }
});
test('old saves gain a phrase arrangement; malformed and unknown clips are rejected', () => {
  const p = makePattern(); const { melody: _, ...old } = p;
  assert.deepEqual(migratePattern(old)?.melody,['a','rest','b']);
  assert.equal(validatePattern({...p,melody:['a','bad','rest']}),null);
  assert.equal(validatePattern({...p,melody:['a']}),null);
});
test('phrase scheduler leaves room for complete audio, skips rest, and changes meter at phrase boundary', async (t) => {
  t.mock.timers.enable({apis:['setTimeout']});
  const raf = globalThis.requestAnimationFrame, cancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const p = makePattern(); p.length = 6; p.bpm = 120; p.melody=['a','rest','b'];
  for (const track of Object.values(p.tracks)) track.steps.fill(0);
  const hits: {when:number;gate:number}[]=[];
  const engine = {time:0,audibleTime:0,unlock:async()=>{},updateMix:()=>{},stopAll:()=>{},trigger:(id:string,when:number,o:{gate:number})=>{if(id==='taepyeongso')hits.push({when,gate:o.gate});}};
  const transport = new Transport(engine as unknown as AudioEngine,{pattern:p,change:()=>{}} as unknown as SequencerStore);
  try {
    await transport.play(); assert.equal(hits.length,1);
    transport.pendingLength=8;
    for(let beat=1;beat<=12;beat++){ engine.time=beat*.5+.06;t.mock.timers.tick(25);if(beat<12)assert.equal(p.length,6); }
    assert.equal(p.length,8); assert.equal(hits.length,1,'rest slot is silent');
    for(let beat=13;beat<=20;beat++){engine.time=beat*.5+.06;t.mock.timers.tick(25);}
    assert.equal(hits.length,2);
    assert.ok(hits[1].when>=hits[0].when+hits[0].gate);
    assert.equal(hits[1].gate,melodyPhrases.b.duration);
    transport.stop();assert.equal(transport.playing,false);
  } finally {transport.stop();globalThis.requestAnimationFrame=raf;globalThis.cancelAnimationFrame=cancel;t.mock.timers.reset();}
});
