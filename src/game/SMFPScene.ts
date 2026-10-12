import { melodyDynamics } from '../config/melodyDynamics';
import Phaser from 'phaser';
import { assetManifest, type LayerId } from '../config/assetManifest';
import { MotionController } from '../visual/MotionController';
import { VisualIntensity } from '../visual/VisualIntensity';
import { visualBus } from '../visual/VisualEventBus';
import { palaceThemes, ridgeHeight, type PalaceId } from '../config/palaceThemes';
import type { TrackId } from '../config/tracks';
const C = { sky: 0x082d69, ink: 0x122e52, jade: 0x57a178, mint: 0xc0d98a, cream: 0xffedb7, coral: 0xff714c, blue: 0x286b9e, white: 0xfffae6 };
export class SMFPScene extends Phaser.Scene {
  intensityTarget = 0;
  reducedMotion = false;
  private motion = new MotionController();
  private intensity = new VisualIntensity();
  private layers = new Map<LayerId, Phaser.GameObjects.Container>();
  private graphics = new Map<LayerId, Phaser.GameObjects.Graphics>();
  private performanceStarted = false;
  private performanceStartTime = 0;
  private decreeProgress = 0;
  private decreeLayer?: Phaser.GameObjects.Container;
  private decreeGraphics?: Phaser.GameObjects.Graphics;
  private decreeText?: Phaser.GameObjects.Text;
  private theme = palaceThemes.gyeongbok;
  private rocks?: Phaser.GameObjects.Graphics;
  setPalace(id: PalaceId) {
    this.theme = palaceThemes[id];
    if (!this.graphics.size) return;
    this.drawSky(); this.drawMountains(); this.drawPines();
  }
  private central?: Phaser.GameObjects.Graphics;
  private off?: () => void;
  private melodyStart = 0;
  private melodyDuration = 0;
  private melodyPhrase = 'a';
  private melodyProgress = 0;
  private stopMelody = () => { this.melodyDuration = 0; };
  constructor() { super('Landscape'); }
  preload() { Object.entries(assetManifest).forEach(([id, url]) => this.load.image(`layer-${id}`, url)); }
  create() {
    (['sky', 'air', 'mountains', 'waterfalls', 'pines', 'waves', 'clouds', 'sun', 'moon', 'lead'] as LayerId[]).forEach(id => {
      const layer = this.add.container(0, 0); this.layers.set(id, layer);
      const g = this.add.graphics(); layer.add(g); this.graphics.set(id, g);
      if (assetManifest[id] && this.textures.exists(`layer-${id}`)) {
        g.setVisible(false); layer.add(this.add.image(0, 0, `layer-${id}`).setOrigin(0).setDisplaySize(640, 360));
      }
    });
    this.drawSky(); this.drawMountains(); this.drawPines();
    this.decreeLayer = this.add.container(0, 0).setDepth(20);
    this.decreeGraphics = this.add.graphics(); this.decreeLayer.add(this.decreeGraphics);
    this.decreeText = this.add.text(320, 161, '명금일하 대취타 하랍신다.', {
      fontFamily: 'Galmuri11', fontSize: '14px', color: '#263652',
      stroke: '#fff4d2', strokeThickness: 2,
    }).setOrigin(.5).setVisible(false);
    this.decreeLayer.add(this.decreeText);
    this.off = visualBus.on(event => {
      // Before the first Play cue, instrument previews are audio-only. Keep the
      // entire landscape frozen until the decree has finished and performance begins.
      if (!this.performanceStarted) return;
      this.motion.trigger(event.track, event.velocity);
      if (event.track === 'taepyeongso' && event.duration) {
        this.melodyStart = this.time.now / 1000; this.melodyDuration = event.duration; this.melodyPhrase = event.phrase ?? 'a';
      }
    });
    window.addEventListener('smfp:melody-stop', this.stopMelody);
    this.events.once('shutdown', () => { this.off?.(); window.removeEventListener('smfp:melody-stop', this.stopMelody); });
    const preview = (id: TrackId) => window.dispatchEvent(new CustomEvent('smfp:preview', { detail: id }));
    this.add.zone(113, 68, 80, 80).setInteractive({ useHandCursor: true }).on('pointerdown', () => preview('jing'));
    this.add.zone(529, 68, 80, 80).setInteractive({ useHandCursor: true }).on('pointerdown', () => preview('jabara'));
    this.add.zone(320, 189, 118, 150).setInteractive({ useHandCursor: true }).on('pointerdown', () => preview('yonggo'));
    this.add.zone(55, 225, 105, 140).setInteractive({ useHandCursor: true }).on('pointerdown', () => preview('nagak'));
    this.add.zone(585, 225, 105, 140).setInteractive({ useHandCursor: true }).on('pointerdown', () => preview('nagak'));
  }
  private rect(g: Phaser.GameObjects.Graphics, color: number, x: number, y: number, w: number, h: number, alpha = 1) {
    g.fillStyle(this.theme.colors[color] ?? color, alpha); g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  private poly(g: Phaser.GameObjects.Graphics, color: number, points: number[], alpha = 1) {
    g.fillStyle(this.theme.colors[color] ?? color, alpha); g.fillPoints(Array.from({ length: points.length / 2 }, (_, i) => new Phaser.Geom.Point(Math.round(points[i * 2]), Math.round(points[i * 2 + 1]))), true);
  }
  private disc(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number, alpha = 1) {
    for (let dy = -r; dy < r; dy += 2) {
      const w = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)) / 2) * 2;
      this.rect(g, color, x - w, y + dy, w * 2, 2, alpha);
    }
  }
  private star(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, alpha = 1) {
    this.rect(g, C.cream, x, y - size, 2, size * 2 + 2, alpha);
    this.rect(g, C.cream, x - size, y, size * 2 + 2, 2, alpha);
  }
  private drawSky() {
    const g = this.graphics.get('sky')!; g.clear();
    this.rect(g, C.sky, 0, 0, 640, 360);
    for (let band = 0; band < 8; band++) this.rect(g, 0x206196, 0, 110 + band * 31, 640, 32, band * .055);
    for (let i = 0; i < 65; i++) {
      const x = (i * 137 + 19) % 624 + 8, y = (i * 71 + 13) % 175 + 9;
      if (i % 7 === 0) this.star(g, x, y, i % 3 + 1, .9);
      else this.rect(g, i % 3 === 0 ? 0x9dcce0 : C.white, x, y, 1, i % 4 === 0 ? 2 : 1, .6);
    }
  }
  private peak(g: Phaser.GameObjects.Graphics, x: number, top: number, width: number) {
    const bottom = 298, half = width / 2;
    // Nested, rounded contour bands inspired by the supplied pixel-art mountain tiers.
    const palette = this.theme.mountain;
    for (let dx = -half; dx <= half; dx += 3) {
      const edge = ridgeHeight(this.theme, dx, half, top);
      this.rect(g, C.ink, x + dx, edge - 2, 3, bottom - edge + 4);
      for (let y = edge; y < bottom; y += 3) {
        const phase = Math.floor((y - edge) % this.theme.band / (this.theme.band / 7)), dark = dx > 7 ? 1 : 0;
        const color = palette[Math.min(6, phase + dark)];
        this.rect(g, color, x + dx, y, 3, Math.min(3, bottom - y));
        if ((Math.floor(dx) * 17 + Math.floor(y) * 3) % 43 === 0 && phase > 2) this.rect(g, C.mint, x + dx, y, 2, 3, .55);
      }
    }
  }
  private drawMountains() {
    const g = this.graphics.get('mountains')!; g.clear();
    const peaks = this.theme.peaks;
    [0, 4, 1, 3].forEach(i => this.peak(g, ...peaks[i]));
    if (!this.central) { this.central = this.add.graphics(); this.layers.get('mountains')!.add(this.central); }
    this.central.clear();
    if (assetManifest.mountains) this.central.setVisible(false);
    this.peak(this.central, ...peaks[2]);
    if (!this.rocks) { this.rocks = this.add.graphics(); this.layers.get('mountains')!.add(this.rocks); }
    const rocks = this.rocks; rocks.clear();
    if (assetManifest.mountains) rocks.setVisible(false);
    for (let i = 0; i < 28; i++) {
      const x = i * 25 - 12, y = 289 - (i * 7) % 17;
      this.disc(rocks, x, y + 8, 15, 0x193e64);
      this.disc(rocks, x - 2, y + 6, 12, 0x497e7c);
      this.rect(rocks, C.mint, x - 7, y - 3, 9, 3);
      this.rect(rocks, 0x25566d, x + 3, y + 3, 6, 14);
    }
  }
  private foliage(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number) {
    const oval = (cx: number, cy: number, rx: number, ry: number, color: number) => {
      for (let dy = -ry; dy <= ry; dy += 2) {
        const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)) / 2) * 2;
        this.rect(g, color, cx - w, cy + dy, w * 2, 2);
      }
    };
    oval(x, y + 3, r + 3, r * .66, 0x102f4b);
    oval(x, y, r, r * .63, 0x205947);
    oval(x - 2, y - 4, r - 2, r * .5, 0x39824d);
    oval(x - 6, y - 7, r * .58, r * .33, 0x63a24f);
    for (let i = 0; i < 35; i++) {
      const dx = ((i * 13) % (r * 2)) - r, dy = ((i * 7) % r) - r / 2;
      if (dx * dx / (r * r) + dy * dy / (r * r * .36) < .8) {
        this.rect(g, i % 3 === 0 ? 0xd2d67c : 0x8abb58, x + dx, y + dy - 3, 2, 3);
        this.rect(g, 0x123e40, x + dx + 2, y + dy + 4, 2, 3);
      }
    }
  }
  private drawPines() {
    const g = this.graphics.get('pines')!; g.clear();
    const style = this.theme.pine;
    [false, true].forEach(mirror => {
      const x = (n: number) => mirror ? 640 - n : n;
      const points = style === 'winding' ? [[37,302],[49,267],[36,227],[52,189],[47,151]]
        : style === 'spreading' ? [[33,302],[41,254],[53,213],[47,169],[63,117]]
        : [[43,302],[45,273],[49,235],[55,207],[62,177]];
      for (let i = 1; i < points.length; i++) {
        const [a,b] = points[i-1], [c,d] = points[i], w = style === 'slender' ? 7 : 11;
        this.poly(g, 0xb95138, [x(a-w),b,x(c-5),d,x(c+5),d,x(a+w),b]);
        this.poly(g, 0xe37442, [x(a-w+3),b,x(c-3),d,x(c+1),d,x(a+2),b]);
      }
      const crowns = style === 'winding' ? [[46,145,20],[73,172,22],[23,188,20],[83,211,24],[36,228,22],[69,252,20]]
        : style === 'spreading' ? [[62,114,26],[87,137,26],[29,157,27],[62,180,27],[112,201,25],[79,230,26],[28,243,24]]
        : [[63,168,19],[88,193,20],[31,208,21],[67,224,22],[29,248,18],[80,259,18]];
      crowns.forEach(([cx,cy,r], i) => {
        const [a,b] = points[Math.min(3, i % points.length)];
        this.poly(g,0xb95138,[x(a-2),b,x(cx-2),cy+7,x(cx+3),cy+5,x(a+3),b]);
        this.rect(g,0xf59351,x(cx),cy+5,3,6);
        this.foliage(g,x(cx),cy,r);
      });
      if (style === 'winding') {
        this.poly(g,0xe37442,[x(71),302,x(82),267,x(72),234,x(78),228,x(89),268,x(81),302]);
        this.foliage(g,x(77),231,18);
      }
      for (let i=0;i<10;i++) this.rect(g,0xf59351,x(points[0][0]-3+i%3),260+i*4,2,3);
      this.disc(g,x(30),300,13,0x203f56);
    });
  }
  openDecree() { return this.animateDecree(1, 850, 'Cubic.Out'); }
  closeDecree() { return this.animateDecree(0, 700, 'Cubic.In'); }
  cancelDecree() { this.tweens.killTweensOf(this); this.decreeProgress = 0; this.drawDecree(); }
  startPerformance() { this.performanceStarted = true; this.performanceStartTime = this.time.now; }
  private animateDecree(value: number, duration: number, ease: string) {
    this.tweens.killTweensOf(this);
    return new Promise<void>(resolve => {
      this.tweens.add({ targets: this, decreeProgress: value, duration, ease, onComplete: () => resolve() });
    });
  }
  private drawDecree() {
    const g = this.decreeGraphics; if (!g) return;
    g.clear();
    const p = Phaser.Math.Clamp(this.decreeProgress, 0, 1);
    if (p <= .005) { this.decreeText?.setVisible(false); return; }
    const fullWidth = 548, width = Math.max(8, Math.round(fullWidth * p));
    const left = Math.round((640 - width) / 2), y = 133, height = 57;
    // Pixel-painted horizontal royal decree unfurls from the center rolls.
    g.fillStyle(0x24344e); g.fillRect(left - 7, y - 8, 14, height + 16);
    g.fillStyle(0xb98b4d); g.fillRect(left - 5, y - 5, 4, height + 10);
    g.fillStyle(0xe4cf91); g.fillRect(left - 1, y - 5, 3, height + 10);
    g.fillStyle(0x24344e); g.fillRect(left + width - 2, y - 8, 14, height + 16);
    g.fillStyle(0xb98b4d); g.fillRect(left + width + 1, y - 5, 4, height + 10);
    g.fillStyle(0xe4cf91); g.fillRect(left + width - 3, y - 5, 3, height + 10);
    if (width > 18) {
      g.fillStyle(0x172b49, .96); g.fillRect(left + 7, y, Math.max(1, width - 14), height);
      g.fillStyle(0xf2e4bb); g.fillRect(left + 10, y + 3, Math.max(1, width - 20), height - 6);
      g.lineStyle(2, 0xc79c55, .95); g.strokeRect(left + 14, y + 7, Math.max(1, width - 28), height - 14);
      g.fillStyle(0xfff0c9); g.fillRect(left + 18, y + 11, Math.max(1, width - 36), height - 22);
    }
    const showWords = p > .91;
    this.decreeText?.setVisible(showWords);
    this.decreeText?.setAlpha(Phaser.Math.Clamp((p - .91) / .09, 0, 1));
  }
  update(time: number, delta: number) {
    const dt = Math.min(delta / 1000, .1);
    if (!this.performanceStarted) {
      this.drawCelestial(0, 0, 0, 0, true);
      this.drawWater(0, 0, 0);
      this.drawAir(0, 0, 0, 0);
      this.drawDecree();
      return;
    }
    this.motion.update(dt);
    const t = Math.max(0, time - this.performanceStartTime) / 1000;
    this.intensity.update(this.intensityTarget, dt);
    const intensity = this.intensity.value, reduce = this.reducedMotion ? .2 : 1;
    const m = (id: TrackId) => this.motion.get(id) * reduce;
    const mountain = this.layers.get('mountains'); if (!mountain) return;
    // One fixed-origin transform moves all five peaks together, never just the center.
    this.central?.setY(0);
    mountain.y = Math.round(m('yonggo') * 7);
    this.layers.get('pines')!.y = -Math.round(m('nagak') * 9);
    this.layers.get('pines')!.x = this.reducedMotion ? 0 : Math.round(Math.sin(t * 6) * m('nagak') * 3);
    this.drawCelestial(t, m('jabara'), m('jing'), intensity);
    this.drawWater(t, m('janggu'), intensity);
    const elapsed = this.time.now / 1000 - this.melodyStart;
    this.melodyProgress = this.melodyDuration ? Math.min(1, elapsed / this.melodyDuration) : 1;
    const envelope = melodyDynamics[this.melodyPhrase] ?? [];
    const amplitude = this.melodyProgress < 1 ? (envelope[Math.floor(elapsed * 20)] ?? 0) : 0;
    this.drawAir(t, m('nabal'), amplitude * reduce, intensity);
  }
  private face(g: Phaser.GameObjects.Graphics, x: number, y: number, blink: boolean, smile: number) {
    this.rect(g, C.ink, x - 12, y - 2, 4, blink ? 2 : 5);
    this.rect(g, C.ink, x + 8, y - 2, 4, blink ? 2 : 5);
    this.rect(g, 0xf5a299, x - 17, y + 5, 6, 3); this.rect(g, 0xf5a299, x + 12, y + 5, 6, 3);
    this.rect(g, C.ink, x - 4, y + 6, 9, 4 + Math.round(smile * 3));
    this.rect(g, C.ink, x - 2, y + 10 + Math.round(smile * 3), 5, 2);
    this.rect(g, 0xf6a38c, x - 2, y + 8 + Math.round(smile * 3), 5, 2);
  }
  private drawCelestial(t: number, sunHit: number, moonHit: number, intensity: number, forceClosed = false) {
    const sun = this.graphics.get('sun')!, moon = this.graphics.get('moon')!;
    sun.clear(); moon.clear();
    const sy = 66 + (this.reducedMotion ? 0 : Math.round(Math.sin(t) * 2));
    const my = 66 + (this.reducedMotion ? 0 : Math.round(Math.sin(t + 2) * 2));
    this.disc(sun, 528, sy, 36 + Math.round(intensity * 3), C.coral, .08 + intensity * .08);
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6, radius = 35 + Math.round(sunHit * 4);
      this.rect(sun, i % 2 ? 0xf8a65c : C.coral, 528 + Math.cos(angle) * radius, sy + Math.sin(angle) * radius, i % 2 ? 2 : 3, i % 2 ? 3 : 2, .6 + sunHit * .3);
    }
    this.disc(sun, 528, sy, 30, 0xb85040); this.disc(sun, 528, sy - 1, 28, 0xfa6847);
    this.disc(sun, 523, sy - 5, 23, 0xff7d4e);
    this.rect(sun, 0xffb165, 513, sy - 23, 19, 3); this.rect(sun, 0xffb165, 508, sy - 20, 7, 4);
    // Broad, sustained rays make cymbal accents visible without a full-screen flash.
    if (sunHit > .02) {
      this.disc(sun, 528, sy, 32 + Math.round(sunHit * 7), 0xffd777, sunHit * .26);
      for (let ray = 0; ray < 12; ray++) {
        const angle = ray * Math.PI / 6;
        for (let r = 39; r < 43 + sunHit * 23; r += 4) {
          this.rect(sun, ray % 2 ? 0xffdd77 : 0xff9b55, 528 + Math.cos(angle) * r - 2, sy + Math.sin(angle) * r - 2, 4, 4, .9 * sunHit);
        }
      }
    }
    this.face(sun, 528, sy + 1, forceClosed || (!this.reducedMotion && t % 5.3 < .13), sunHit);
    this.disc(moon, 113, my, 37, C.cream, .05 + intensity * .07);
    this.disc(moon, 113, my, 30, 0x83a8b8); this.disc(moon, 113, my - 1, 28, 0xe6e2bf);
    this.disc(moon, 110, my - 4, 26, 0xfff1c9);
    this.rect(moon, C.white, 98, my - 22, 16, 3);
    this.face(moon, 113, my + 1, forceClosed || (!this.reducedMotion && (t + 2) % 5.7 < .13), moonHit);
    if (moonHit > .01) for (let ring = 0; ring < 2; ring++) {
      const radius = 33 + (1 - moonHit) * 29 + ring * 9;
      for (let a = 0; a < 44; a++) this.rect(moon, C.cream, 113 + Math.cos(a / 44 * Math.PI * 2) * radius, my + Math.sin(a / 44 * Math.PI * 2) * radius, 2, 2, moonHit * .7);
    }
  }
  private drawWater(t: number, waterfallPulse: number, intensity: number) {
    const waterfall = this.graphics.get('waterfalls')!, waves = this.graphics.get('waves')!;
    waterfall.clear(); waves.clear();
    const pulse = Math.max(0, Math.min(1.5, waterfallPulse));
    [185, 433].forEach((x, i) => {
      const streamWidth = 19 + Math.round(pulse * 8);
      this.rect(waterfall, 0x234a74, x - 4 - Math.round(pulse * 4), 186, 27 + Math.round(pulse * 8), 115);
      this.rect(waterfall, 0x82c4de, x - Math.round(pulse * 3), 188, streamWidth, 109); this.rect(waterfall, C.white, x + 2, 187, 6 + Math.round(pulse * 2), 110);
      this.rect(waterfall, 0xb5e1e8, x + 12 + Math.round(pulse * 2), 191, 4 + Math.round(pulse * 2), 106);
      this.rect(waterfall, C.white, x - 6, 184, 19, 4); this.rect(waterfall, C.white, x - 2, 188, 7, 5);
      // Tall, bright streaks travel down the full cascade; a janggu hit widens and
      // brightens them so the response reads clearly even on a small screen.
      for (let j = 0; j < 14; j++) {
        const y = 192 + (j * 17 + Math.floor(t * (this.reducedMotion ? 8 : 72 + pulse * 36)) + i * 11) % 105;
        const streakX = x + 2 + (j * 7) % Math.max(7, streamWidth - 5);
        const streakHeight = 7 + Math.round(pulse * 9);
        this.rect(waterfall, j % 2 ? C.white : 0x489bc2, streakX, y, 3 + Math.round(pulse * 2), streakHeight, .8 + intensity * .2);
      }
      for (let j = 0; j < 10; j++) {
        const angle = j * 2.17 + i * .7 + t * 3;
        const spread = 9 + pulse * 23;
        const dx = Math.sin(angle) * spread;
        const lift = 7 + Math.abs(Math.cos(angle * .8)) * (8 + pulse * 24);
        const size = 2 + Math.round(pulse * 2);
        this.rect(waterfall, j % 2 ? C.white : 0xc7f1ec, x + 8 + dx, 296 - lift, size, size, .9);
      }
      if (pulse > .02) {
        // A broad, rising foam burst makes each beat visibly splash upward.
        const foamY = 294 - Math.round(pulse * 12);
        this.rect(waterfall, 0x8ed9e5, x - 13 - Math.round(pulse * 6), foamY + 4, 43 + Math.round(pulse * 12), 5 + Math.round(pulse * 3), .88);
        this.rect(waterfall, C.white, x - 8 - Math.round(pulse * 8), foamY, 34 + Math.round(pulse * 16), 4 + Math.round(pulse * 2), .95);
        this.rect(waterfall, C.white, x - 15 - Math.round(pulse * 6), foamY + 7, 12, 3, .85);
        this.rect(waterfall, C.white, x + 25 + Math.round(pulse * 3), foamY + 5, 13, 3, .85);
      }
      this.disc(waterfall, x + 8, 300, 21, 0xaed9dc); this.rect(waterfall, C.white, x - 13, 297, 43, 3);
    });
    this.rect(waves, 0x1c5484, 0, 299, 640, 61);
    for (let row = 0; row < 3; row++) {
      const base = 311 + row * 23, height = this.theme.waveHeight;
      const wavelength = this.theme.wavelength;
      const speed = (row % 2 ? -1 : 1) * (this.reducedMotion ? 2 : 9);
      const offset = Math.floor(t * speed) % wavelength;
      for (let x = -100; x < 740; x += wavelength) {
        const dx = x + offset + row * 23;
        for (let col = 0; col < wavelength; col += 3) {
          const y = base - Math.round(Math.sin(col / wavelength * Math.PI) * height);
          this.rect(waves, 0x164579, dx + col, y - 2, 3, 37);
          this.rect(waves, 0x4289b2, dx + col, y, 3, 28);
          this.rect(waves, 0x99d0df, dx + col, y + 1, 3, 5);
          this.rect(waves, C.white, dx + col, y, 3, this.theme.wave === 'crest' ? 3 : 1);
          if (this.theme.wave === 'contour') {
            this.rect(waves, 0x164579, dx + col, y + 6, 3, 1);
            this.rect(waves, 0x164579, dx + col, y + 10, 3, 1);
          }
          this.rect(waves, 0x255e91, dx + col, y + 12, 3, 13);
          this.rect(waves, 0x7ab7ce, dx + col, y + 16, 3, 2);
        }
        if (this.theme.wave === 'crest') {
        this.disc(waves, dx + 56, base - 4, 8, C.white);
        this.disc(waves, dx + 54, base - 3, 5, 0x72b2d0);
        this.rect(waves, C.white, dx + 50, base - 4, 4, 3);
        this.rect(waves, C.white, dx + 39, base - height - 6, 2, 3, .75);
        } else if (this.theme.wave === 'contour') {
          for (let j=0;j<5;j++) this.rect(waves,C.white,dx+wavelength*.6+j*3,base-height-4-Math.sin(j)*4,2,2,.8);
        }
      }
    }
  }
  private cloud(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number) {
    [[0, 0, 8], [11, -6, 13], [24, 0, 8], [31, 4, 5]].forEach(([dx, dy, r]) => {
      this.disc(g, x + dx * scale, y + dy * scale, Math.round(r * scale), 0x91b8d5);
      this.disc(g, x + dx * scale, y + (dy - 2) * scale, Math.round((r - 2) * scale), C.white);
    });
    this.rect(g, 0xd2e1e0, x - 6 * scale, y + 6 * scale, 43 * scale, 3 * scale);
    const spiral = [[2, 1], [2, -5], [5, -8], [13, -8], [16, -5], [16, 1], [13, 4], [8, 4], [6, 1], [6, -2], [10, -3], [11, 0]];
    for (let i = 1; i < spiral.length; i++) {
      const [a, b] = spiral[i - 1], [c, d] = spiral[i];
      this.rect(g, 0x6699bf, x + Math.min(a, c) * scale, y + Math.min(b, d) * scale, Math.max(2, Math.abs(a - c) * scale), Math.max(2, Math.abs(b - d) * scale));
    }
  }
  private drawAir(t: number, horn: number, lead: number, intensity: number) {
    const clouds = this.graphics.get('clouds')!, air = this.graphics.get('air')!, streak = this.graphics.get('lead')!;
    clouds.clear(); air.clear(); streak.clear();
    [[19, 65, .9], [176, 87, .75], [408, 80, .85], [604, 48, .9]].forEach(([x, y, scale], i) => {
      const drift = this.reducedMotion ? 0 : Math.round(Math.sin(t * .16 + i * 2) * 9);
      this.cloud(clouds, x + drift + (this.reducedMotion ? 0 : Math.round(lead * Math.sin(t * 2 + i) * 6)), y, scale);
    });
    if (horn > .01) {
      const radius = 70 + (1 - horn) * 185;
      for (let i = 0; i < 88; i++) {
        const a = Math.PI + i / 88 * Math.PI;
        this.rect(air, C.cream, 320 + Math.cos(a) * radius, 251 + Math.sin(a) * radius * .72, 3, 3, horn * .55);
      }
    }
    if (lead > .01) {
      const progress = this.reducedMotion ? .5 : this.melodyProgress;
      const x = 165 + progress * 310, y = 73 - Math.sin(progress * Math.PI) * 35;
      const color = this.melodyPhrase === 'b' ? 0x8ec9c4 : this.melodyPhrase === 'c' ? 0xbc9cd8 : C.cream;
      for (let i = 1; i <= 14; i++) {
        const p = Math.max(0, progress - i * .012);
        this.rect(streak, color, 165 + p * 310, 73 - Math.sin(p * Math.PI) * 35, 4, 3, (.25 + lead * .65) * (1 - i / 15));
      }
      this.star(streak, x, y, 3 + Math.round(lead * 3), .5 + lead * .5);
    }
    this.theme.peaks.forEach(([x, top, width]) => {
      const half = width / 2;
      for (let dx = -half / 2; dx < half / 2; dx += 3) {
        const yy = ridgeHeight(this.theme, dx, half, top) + this.layers.get('mountains')!.y;
        this.rect(streak, C.cream, x + dx, yy, 3, 2, intensity * .14 + lead * .3);
      }
    });
    for (let i = 0; i < 12; i++) {
      const alpha = Math.max(0, Math.sin(t * 1.3 + i * 3)) * intensity * .65;
      this.star(streak, 125 + i * 34, 264 - (i * 37) % 100, 1, alpha);
    }
  }
}
