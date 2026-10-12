/** AbortController also works in browsers without AbortSignal.timeout. */
export async function loadAudio(context: AudioContext, url: string): Promise<AudioBuffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Audio HTTP ${response.status}: ${url}`);
    const bytes = await response.arrayBuffer();
    return await context.decodeAudioData(bytes);
  } finally { clearTimeout(timer); }
}

export function releaseGain(gain: AudioParam, at: number) {
  if (typeof gain.cancelAndHoldAtTime === 'function') gain.cancelAndHoldAtTime(at);
  else {
    const value = gain.value;
    gain.cancelScheduledValues(at);
    gain.setValueAtTime(value, at);
  }
  gain.linearRampToValueAtTime(0, at + .008);
}
