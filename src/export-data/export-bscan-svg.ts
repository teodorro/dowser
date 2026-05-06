import { escapeXml } from './shared';
import {
  buildDepthRulerSvg,
  buildLengthRulerSvg,
  buildTimeRulerSvg,
} from './axes';

export interface BscanViewSvgLayout {
  cssW: number;
  cssH: number;
  ruler: { left: number; top: number; right: number; bottom: number };
  vp: { x: number; y: number; w: number; h: number };
  scale: number;
  tx: number;
  ty: number;
  cols: number;
  rows: number;
  heatmapPngDataUrl: string;
  bscan: number[][];
  dx: number;
  dt: number;
  velocity: number;
}

export function buildBscanViewSvgString(p: BscanViewSvgLayout): string {
  const { cssW, cssH, vp, scale, tx, ty, cols, rows, heatmapPngDataUrl } = p;

  const clipId = 'bscan-vp-clip';
  const imgX = vp.x + tx;
  const imgY = vp.y + ty;
  const imgW = cols * scale;
  const imgH = rows * scale;

  const escapedHref = escapeXml(heatmapPngDataUrl);

  const rulers = [
    buildLengthRulerSvg(p),
    buildTimeRulerSvg(p),
    buildDepthRulerSvg(p),
  ].join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${cssW}" height="${cssH}" viewBox="0 0 ${cssW} ${cssH}">
  <rect x="0" y="0" width="${cssW}" height="${cssH}" fill="#fff"/>
  <defs>
    <clipPath id="${clipId}">
      <rect x="${vp.x}" y="${vp.y}" width="${vp.w}" height="${vp.h}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#${clipId})">
    <image href="${escapedHref}" xlink:href="${escapedHref}" x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" preserveAspectRatio="none"/>
  </g>
  ${rulers}
</svg>`;
}

export function bscanViewSvgFilename(baseName: string): string {
  const trimmed = baseName.trim() || 'bscan';
  const safe = trimmed.replace(/[/\\?%*:|"<>]/g, '_');
  return `${safe}.gpr-radargram.svg`;
}
