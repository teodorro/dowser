import * as d3 from 'd3';
import { escapeXml, type RulerMargins, type ViewportRect } from './shared';
import { buildLengthRulerSvgCore } from './axes';
import clamp from '../shared/clamp';

export interface FftBscanViewSvgLayout {
  cssW: number;
  cssH: number;
  ruler: RulerMargins;
  vp: ViewportRect;
  scale: number;
  tx: number;
  ty: number;
  cols: number;
  rows: number;
  heatmapPngDataUrl: string;
  horizCount: number;
  dx: number;
  freqAxis: number[];
  fftRowCount: number;
}

function buildFrequencyRulerSvg(p: FftBscanViewSvgLayout): string {
  const { vp, ruler, scale, ty, freqAxis, fftRowCount } = p;
  const faLen = freqAxis.length;
  if (!faLen || !fftRowCount) return '';

  const wyMin = clamp((0 - ty) / scale, 0, faLen);
  const wyMax = clamp((vp.h - ty) / scale, 0, faLen);

  const fVisMin = freqAxis[Math.floor(wyMin)];
  const fVisMax = freqAxis[Math.floor(wyMax - 1)];
  if (!Number.isFinite(fVisMin) || !Number.isFinite(fVisMax)) return '';

  const minLabelPx = 24;
  const maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
  const ticks = d3.ticks(fVisMin, fVisMax, maxTicks);
  const step = d3.tickStep(fVisMin, fVisMax, maxTicks);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) decimals = 1;
  const fmf = d3.format(`.${decimals}f`);

  const tToWy = d3
    .scaleLinear()
    .domain([freqAxis[0], freqAxis[freqAxis.length - 1]])
    .range([0, fftRowCount]);

  const parts: string[] = [];
  parts.push(
    `<rect x="0" y="${vp.y}" width="${ruler.left}" height="${vp.h}" fill="#fff"/>`,
  );
  parts.push(
    `<line x1="${ruler.left - 3}" y1="${vp.y + wyMin * scale + ty}" x2="${ruler.left - 3}" y2="${vp.y + wyMax * scale + ty}" stroke="#444" stroke-width="1"/>`,
  );
  const titleY = vp.y + ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + ty;
  parts.push(
    `<text transform="translate(12 ${titleY}) rotate(-90)" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#444">${escapeXml('Частота, МГц')}</text>`,
  );

  for (const t of ticks) {
    const wy = tToWy(t);
    const y = vp.y + (wy * scale + ty);
    const label = escapeXml(fmf(t));
    if (y < vp.y || y > vp.y + vp.h) continue;
    parts.push(
      `<line x1="${ruler.left - 8}" y1="${y}" x2="${ruler.left - 3}" y2="${y}" stroke="#444" stroke-width="1"/>`,
    );
    parts.push(
      `<text x="${ruler.left - 10}" y="${y}" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#444">${label}</text>`,
    );
  }

  return parts.join('\n');
}

export function buildFftBscanViewSvgString(p: FftBscanViewSvgLayout): string {
  const { cssW, cssH, vp, scale, tx, ty, cols, rows, heatmapPngDataUrl } = p;

  const clipId = 'fft-bscan-vp-clip';
  const imgX = vp.x + tx;
  const imgY = vp.y + ty;
  const imgW = cols * scale;
  const imgH = rows * scale;
  const escapedHref = escapeXml(heatmapPngDataUrl);

  const rulers = [
    buildFrequencyRulerSvg(p),
    buildLengthRulerSvgCore({
      vp: p.vp,
      ruler: p.ruler,
      scale: p.scale,
      tx: p.tx,
      horizCount: p.horizCount,
      dx: p.dx,
    }),
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

export function fftBscanViewSvgFilename(baseName: string): string {
  const trimmed = baseName.trim() || 'fft';
  const safe = trimmed.replace(/[/\\?%*:|"<>]/g, '_');
  return `${safe}.gpr-fft.svg`;
}
