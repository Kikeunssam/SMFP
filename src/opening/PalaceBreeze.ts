/** A local cloth ripple over the existing painting; poles and palace stay still. */
export function mountPalaceBreeze(host: HTMLElement): () => void {
  const canvas = document.createElement('canvas');
  canvas.className = 'opening-breeze';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const painting = new Image();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  let frame = 0;
  let lastDraw = 0;
  // Coordinates are normalized to the reference painting's 1672 × 941 layout.
  // The pole side and the top seam are fixed; the free hem catches the breeze.
  const flags = [
    { x: 43, y: 423, w: 47, h: 145, pole: 10, phase: 0 },
    { x: 155, y: 413, w: 48, h: 155, pole: 12, phase: .7 },
    { x: 262, y: 478, w: 41, h: 117, pole: 9, phase: 1.3 },
    { x: 1376, y: 478, w: 38, h: 117, pole: 28, phase: .4 },
    { x: 1470, y: 414, w: 53, h: 144, pole: 45, phase: 1.1 },
    { x: 1588, y: 429, w: 53, h: 140, pole: 41, phase: 1.8 },
  ];
  painting.onload = () => {
    if (disposed || !ctx) return;
    const scale = painting.naturalWidth / 1672;
    canvas.width = painting.naturalWidth;
    canvas.height = painting.naturalHeight;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(painting, 0, 0);
    const patches = flags.map(flag => {
      const x = Math.round(flag.x * scale), y = Math.round(flag.y * scale);
      const w = Math.round(flag.w * scale), h = Math.round(flag.h * scale);
      return { ...flag, x, y, w, h, pole: flag.pole * scale,
        original: ctx.getImageData(x, y, w, h), output: ctx.createImageData(w, h) };
    });
    const draw = (now: number) => {
      if (disposed) return;
      frame = requestAnimationFrame(draw);
      if (document.hidden || now - lastDraw < 50) return;
      lastDraw = now;
      const t = now / 1000;
      for (const patch of patches) {
        const { w, h, original, output, pole, phase } = patch;
        for (let y = 0; y < h; y++) {
          const v = y / (h - 1);
          const hem = Math.sin(Math.PI * v);
          const wave = Math.sin(t * 2.5 - v * 7 + phase) + .35 * Math.sin(t * 4.1 - v * 11 + phase);
          for (let x = 0; x < w; x++) {
            const edge = Math.min(1, x / (7 * scale), (w - 1 - x) / (7 * scale));
            const anchor = Math.min(1, Math.abs(x - pole) / (13 * scale));
            const shift = reducedMotion.matches ? 0 : wave * 3.2 * scale * hem * edge * anchor;
            const sx = Math.max(0, Math.min(w - 1, Math.round(x - shift)));
            const dest = (y * w + x) * 4, source = (y * w + sx) * 4;
            output.data[dest] = original.data[source];
            output.data[dest + 1] = original.data[source + 1];
            output.data[dest + 2] = original.data[source + 2];
            output.data[dest + 3] = original.data[source + 3];
          }
        }
        ctx.putImageData(output, patch.x, patch.y);
      }
    };
    frame = requestAnimationFrame(draw);
  };
  painting.src = '/opening-geunjeongjeon-empty.png';
  return () => { disposed = true; cancelAnimationFrame(frame); canvas.remove(); };
}
