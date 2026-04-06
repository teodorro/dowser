import * as d3 from 'd3';

const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function bitmapToPngDataUrl(bmp: ImageBitmap): Promise<string> {
  const c = document.createElement('canvas');
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bmp, 0, 0);
  return c.toDataURL('image/png');
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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

function buildLengthRulerSvg(p: BscanViewSvgLayout): string {
  const { vp, ruler, scale, tx, bscan, dx } = p;
  const horizCount = bscan.length;
  if (!horizCount) return '';

  const wxMin = clamp((0 - tx) / scale, 0, horizCount);
  const wxMax = clamp((vp.w - tx) / scale, 0, horizCount);

  const xVisMin = wxMin * dx;
  const xVisMax = wxMax * dx;

  const minLabelPx = 131;
  const maxTicks = Math.max(2, Math.floor(vp.w / minLabelPx));
  const ticks = d3.ticks(xVisMin, xVisMax, maxTicks);
  const step = d3.tickStep(xVisMin, xVisMax, maxTicks);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) decimals = 1;
  const fmx = d3.format(`.${decimals}f`);

  const xToWx = d3
    .scaleLinear()
    .domain([0, horizCount * dx])
    .range([0, horizCount]);

  const parts: string[] = [];
  parts.push(
    `<rect x="${vp.x}" y="0" width="${vp.w}" height="${ruler.top}" fill="#fff"/>`,
  );
  parts.push(
    `<line x1="${vp.x + wxMin * scale + tx}" y1="${ruler.top - 3}" x2="${vp.x + wxMax * scale + tx}" y2="${ruler.top - 3}" stroke="#444" stroke-width="1"/>`,
  );
  const titleX =
    vp.x + ((wxMax - wxMin) / 2 + wxMin) * scale + tx;
  parts.push(
    `<text x="${titleX}" y="${ruler.top - 35}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#444">${escapeXml('Длина, м')}</text>`,
  );

  for (const t of ticks) {
    const wx = xToWx(t);
    const x = vp.x + (wx * scale + tx);
    const label = escapeXml(fmx(t));
    if (x < vp.x || x > vp.x + vp.w) continue;
    parts.push(
      `<line x1="${x}" y1="${ruler.top - 8}" x2="${x}" y2="${ruler.top - 3}" stroke="#444" stroke-width="1"/>`,
    );
    parts.push(
      `<text x="${x}" y="${ruler.top - 16}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#444">${label}</text>`,
    );
  }

  return parts.join('\n');
}

function buildTimeRulerSvg(p: BscanViewSvgLayout): string {
  const { vp, ruler, scale, ty, bscan, dt } = p;
  const depthRows = bscan[0]?.length ?? 0;
  if (!depthRows) return '';

  const wyMin = clamp((0 - ty) / scale, 0, depthRows);
  const wyMax = clamp((vp.h - ty) / scale, 0, depthRows);

  const tVisMin = wyMin * dt;
  const tVisMax = wyMax * dt;

  const minLabelPx = 24;
  const maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
  const ticks = d3.ticks(tVisMin, tVisMax, maxTicks);
  const step = d3.tickStep(tVisMin, tVisMax, maxTicks);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) decimals = 1;
  const fmt = d3.format(`.${decimals}f`);

  const tToWy = d3
    .scaleLinear()
    .domain([0, depthRows * dt])
    .range([0, depthRows]);

  const parts: string[] = [];
  parts.push(
    `<rect x="0" y="${vp.y}" width="${ruler.left}" height="${vp.h}" fill="#fff"/>`,
  );
  parts.push(
    `<line x1="${ruler.left - 3}" y1="${vp.y + wyMin * scale + ty}" x2="${ruler.left - 3}" y2="${vp.y + wyMax * scale + ty}" stroke="#444" stroke-width="1"/>`,
  );
  const titleY =
    vp.y + ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + ty;
  parts.push(
    `<text transform="translate(12 ${titleY}) rotate(-90)" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#444">${escapeXml('Время, нс')}</text>`,
  );

  for (const t of ticks) {
    const wy = tToWy(t);
    const y = vp.y + (wy * scale + ty);
    const label = escapeXml(fmt(t));
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

function buildDepthRulerSvg(p: BscanViewSvgLayout): string {
  const { vp, ruler, scale, ty, bscan, dt, velocity } = p;
  const depthRows = bscan[0]?.length ?? 0;
  if (!depthRows) return '';

  const wyMin = clamp((0 - ty) / scale, 0, depthRows);
  const wyMax = clamp((vp.h - ty) / scale, 0, depthRows);

  const tVisMin = (wyMin * dt * velocity) / 2;
  const tVisMax = (wyMax * dt * velocity) / 2;

  const minLabelPx = 34;
  const maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
  const ticks = d3.ticks(tVisMin, tVisMax, maxTicks);
  const step = d3.tickStep(tVisMin, tVisMax, maxTicks);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) decimals = 1;
  const fmt = d3.format(`.${decimals}f`);

  const tToWy = d3
    .scaleLinear()
    .domain([0, (depthRows * dt * velocity) / 2])
    .range([0, depthRows]);

  const rightX = vp.w + ruler.left;
  const parts: string[] = [];
  parts.push(
    `<rect x="${vp.x + vp.w}" y="${vp.y}" width="${ruler.right}" height="${vp.h}" fill="#fff"/>`,
  );
  parts.push(
    `<line x1="${rightX + 3}" y1="${vp.y + wyMin * scale + ty}" x2="${rightX + 3}" y2="${vp.y + wyMax * scale + ty}" stroke="#444" stroke-width="1"/>`,
  );
  const titleY =
    vp.y + ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + ty;
  parts.push(
    `<text transform="translate(${rightX + 50} ${titleY}) rotate(-90)" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#444">${escapeXml('Глубина, м')}</text>`,
  );

  for (const t of ticks) {
    const wy = tToWy(t);
    const y = vp.y + (wy * scale + ty);
    const label = escapeXml(fmt(t));
    if (y < vp.y || y > vp.y + vp.h) continue;
    parts.push(
      `<line x1="${rightX + 8}" y1="${y}" x2="${rightX + 3}" y2="${y}" stroke="#444" stroke-width="1"/>`,
    );
    parts.push(
      `<text x="${rightX + 15}" y="${y}" text-anchor="start" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#444">${label}</text>`,
    );
  }

  return parts.join('\n');
}

export function buildBscanViewSvgString(p: BscanViewSvgLayout): string {
  const {
    cssW,
    cssH,
    vp,
    scale,
    tx,
    ty,
    cols,
    rows,
    heatmapPngDataUrl,
  } = p;

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
  return `${safe}-view.svg`;
}
