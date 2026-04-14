import * as d3 from 'd3';
import {
  clamp,
  escapeXml,
  type RulerMargins,
  type ViewportRect,
} from './shared';
import type { BscanViewSvgLayout } from './export-bscan-svg';

export function buildLengthRulerSvgCore(params: {
  vp: ViewportRect;
  ruler: RulerMargins;
  scale: number;
  tx: number;
  horizCount: number;
  dx: number;
}): string {
  const { vp, ruler, scale, tx, horizCount, dx } = params;
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
  const titleX = vp.x + ((wxMax - wxMin) / 2 + wxMin) * scale + tx;
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

export function buildLengthRulerSvg(p: BscanViewSvgLayout): string {
  return buildLengthRulerSvgCore({
    vp: p.vp,
    ruler: p.ruler,
    scale: p.scale,
    tx: p.tx,
    horizCount: p.bscan.length,
    dx: p.dx,
  });
}

export function buildTimeRulerSvg(p: BscanViewSvgLayout): string {
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
  const titleY = vp.y + ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + ty;
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

export function buildDepthRulerSvg(p: BscanViewSvgLayout): string {
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
  const titleY = vp.y + ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + ty;
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
