import type { AudioEngine } from '../audio/AudioEngine';

/** The progress meter follows the voice, not a simulated download. */
export async function runOpeningCeremony(host: HTMLElement, audio: AudioEngine) {
  host.classList.add('ceremony');
  const stage = document.createElement('div');
  stage.className = 'ceremony-stage';
  stage.innerHTML = `<div class="royal-scroll"><div class="scroll-paper"><p>명금일하<br class="scroll-mobile-break"> 대취타 하랍신다</p></div></div>
    <div class="ceremony-loading"><p role="status">취타대 준비 중</p><div class="ceremony-meter" role="progressbar" aria-label="취타대 준비 중" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">${'<i></i>'.repeat(24)}</div></div>`;
  host.append(stage);
  const meter = stage.querySelector<HTMLElement>('.ceremony-meter')!;
  const cells = Array.from(meter.children);
  const progress = (amount: number) => {
    meter.setAttribute('aria-valuenow', String(Math.round(amount * 100)));
    cells.forEach((cell, i) => cell.classList.toggle('filled', i < Math.ceil(amount * cells.length)));
  };
  let frame = 0;
  try {
    // Called inside the original click gesture so browser audio is unlocked.
    await audio.unlock();
    const start = audio.time;
    const tick = () => {
      progress(Math.min(.98, Math.max(0, (audio.time - start) / Math.max(.1, audio.announcementDuration))));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const heard = await audio.playAnnouncement();
    if (!heard) await new Promise(resolve => setTimeout(resolve, 1200));
  } catch (error) {
    console.warn('Opening voice unavailable; continuing to the sequencer.', error);
    await new Promise(resolve => setTimeout(resolve, 1200));
  } finally {
    cancelAnimationFrame(frame);
    progress(1);
  }
  await new Promise(resolve => setTimeout(resolve, 350));
  stage.classList.add('ceremony-done');
  await new Promise(resolve => setTimeout(resolve, 450));
  stage.remove();
}
