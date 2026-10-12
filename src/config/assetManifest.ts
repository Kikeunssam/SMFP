export type LayerId = 'sky' | 'air' | 'mountains' | 'waterfalls' | 'pines' | 'waves' | 'clouds' | 'sun' | 'moon' | 'lead';
// Optional transparent, 640 × 360 PNG layers, aligned to the full scene canvas.
// Assigned PNGs replace generated artwork. Add sprite animation/anchors in SMFPScene as needed.
export const assetManifest: Partial<Record<LayerId, string>> = {};
