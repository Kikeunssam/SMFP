import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseGain } from '../src/audio/loadAudio';
import { SampleBank } from '../src/audio/SampleBank';

test('releasing a voice works without cancelAndHoldAtTime', () => {
  const calls: unknown[][] = [];
  const gain = { value: .8, cancelScheduledValues: (...a: unknown[]) => calls.push(['cancel', ...a]), setValueAtTime: (...a: unknown[]) => calls.push(['set', ...a]), linearRampToValueAtTime: (...a: unknown[]) => calls.push(['ramp', ...a]) };
  releaseGain(gain as unknown as AudioParam, 2);
  assert.deepEqual(calls, [['cancel', 2], ['set', .8, 2], ['ramp', 0, 2.008]]);
});

test('failed downloads retry while successfully decoded instruments stay cached', async t => {
  let offline = true;
  const requests: string[] = [];
  t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    requests.push(url);
    if (offline && url.includes('janggu')) throw new Error('offline');
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) };
  });
  const context = { decodeAudioData: async () => ({ duration: 1 }) } as unknown as AudioContext;
  const bank = new SampleBank();
  await bank.load(context);
  assert.equal(bank.status.get('janggu'), 'silent');
  assert.equal(bank.status.get('yonggo'), 'sample');
  offline = false;
  await bank.load(context);
  assert.equal(bank.status.get('janggu'), 'sample');
  assert.equal(requests.length, 8);
});
