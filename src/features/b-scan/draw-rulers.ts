import * as d3 from 'd3';
import clamp from '../../shared/clamp';
import type { RefObject } from 'react';

export const drawRulers = (
  ctx: CanvasRenderingContext2D,
  bscan: number[][],
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  tx: number,
  ty: number,
  scale: number,
  dx: number,
  dt: number,
  velocity: number,
  ruler: { left: number; top: number; right: number; bottom: number },
) => {
  if (bscan == null || bscan.length === 0) return;
  const vp = vpRef.current;
  const rows = bscan[0].length;
  const cols = bscan.length;

  const wyMin = clamp((0 - ty) / scale, 0, rows);
  const wyMax = clamp((vp.h - ty) / scale, 0, rows);
  const wxMin = clamp((0 - tx) / scale, 0, cols);
  const wxMax = clamp((vp.w - tx) / scale, 0, cols);

  drawTimeRuler(ctx, wyMin, wyMax, bscan, vpRef, ruler, ty, dt, scale);
  drawLengthRuler(ctx, wxMin, wxMax, bscan, vpRef, ruler, tx, dx, scale);
  drawDepthRuler(
    ctx,
    wyMin,
    wyMax,
    bscan,
    vpRef,
    ruler,
    ty,
    dt,
    velocity,
    scale,
  );
};

const drawLengthRuler = (
  ctx: CanvasRenderingContext2D,
  wxMin: number,
  wxMax: number,
  bscan: number[][],
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  ruler: { left: number; top: number; right: number; bottom: number },
  tx: number,
  dx: number,
  scale: number,
) => {
  const rows = bscan.length;
  const vp = vpRef.current;
  const xVisMin = wxMin * dx;
  const xVisMax = wxMax * dx;

  const minLabelPx = 131;
  const maxTicks = Math.max(2, Math.floor(vp.w / minLabelPx));
  const ticks = d3.ticks(xVisMin, xVisMax, maxTicks);
  const step = d3.tickStep(xVisMin, xVisMax, maxTicks);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) {
    decimals = 1;
  }
  const fmx = d3.format(`.${decimals}f`);

  ctx.fillStyle = '#fff';
  ctx.fillRect(vp.x, 0, vp.w, ruler.top);

  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;

  const xToWx = d3
    .scaleLinear()
    .domain([0, rows * dx])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(wxMin * scale + tx + ruler.left, ruler.top - 3);
  ctx.lineTo(wxMax * scale + tx + ruler.left, ruler.top - 3);
  ctx.stroke();

  ctx.font = '12px Arial';
  ctx.fillStyle = '#444';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Длина, м',
    ((wxMax - wxMin) / 2 + wxMin) * scale + tx + ruler.left,
    ruler.top - 35,
  );

  for (const t of ticks) {
    const wx = xToWx(t);
    const x = vp.x + (wx * scale + tx);
    const label = fmx(t);

    if (x < vp.x || x > vp.x + vp.w) continue;

    ctx.beginPath();
    ctx.moveTo(x, ruler.top - 8);
    ctx.lineTo(x, ruler.top - 3);
    ctx.stroke();

    ctx.font = '12px Arial';
    ctx.fillStyle = '#444';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, ruler.top - 16);
  }
};

const drawTimeRuler = (
  ctx: CanvasRenderingContext2D,
  wyMin: number,
  wyMax: number,
  bscan: number[][],
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  ruler: { left: number; top: number; right: number; bottom: number },
  ty: number,
  dt: number,
  scale: number,
) => {
  const rows = bscan[0].length;
  const vp = vpRef.current;
  const tVisMin = wyMin * dt;
  const tVisMax = wyMax * dt;

  const minLabelPx = 24;
  const maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
  const ticks = d3.ticks(tVisMin, tVisMax, maxTicks);
  const step = d3.tickStep(tVisMin, tVisMax, maxTicks);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) {
    decimals = 1;
  }
  const fmt = d3.format(`.${decimals}f`);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, vp.y, ruler.left, vp.h);

  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;

  const tToWy = d3
    .scaleLinear()
    .domain([0, rows * dt])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(ruler.left - 3, wyMin * scale + ty + ruler.top);
  ctx.lineTo(ruler.left - 3, wyMax * scale + ty + ruler.top);
  ctx.stroke();

  ctx.save();
  const x = 12;
  const y = ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + ty + ruler.top;
  ctx.translate(x, y);
  ctx.font = '12px Arial';
  ctx.fillStyle = '#444';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'end';
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Время, нс', 0, 0);
  ctx.restore();

  for (const t of ticks) {
    const wy = tToWy(t);
    const y = vp.y + (wy * scale + ty);
    const label = fmt(t);

    if (y < vp.y || y > vp.y + vp.h) continue;

    ctx.beginPath();
    ctx.moveTo(ruler.left - 8, y);
    ctx.lineTo(ruler.left - 3, y);
    ctx.stroke();

    ctx.font = '12px Arial';
    ctx.fillStyle = '#444';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'end';
    ctx.fillText(label, ruler.left - 10, y);
  }
};

const drawDepthRuler = (
  ctx: CanvasRenderingContext2D,
  wyMin: number,
  wyMax: number,
  bscan: number[][],
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  ruler: { left: number; top: number; right: number; bottom: number },
  ty: number,
  dt: number,
  velocity: number,
  scale: number,
) => {
  const rows = bscan[0].length;
  const vp = vpRef.current;
  const tVisMin = (wyMin * dt * velocity) / 2;
  const tVisMax = (wyMax * dt * velocity) / 2;

  const minLabelPx = 34;
  const maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
  const ticks = d3.ticks(tVisMin, tVisMax, maxTicks);
  const step = d3.tickStep(tVisMin, tVisMax, maxTicks);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) {
    decimals = 1;
  }
  const fmt = d3.format(`.${decimals}f`);

  ctx.fillStyle = '#fff';
  ctx.fillRect(vp.x + vp.w, vp.y, ruler.right, vp.h);

  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;

  const tToWy = d3
    .scaleLinear()
    .domain([0, (rows * dt * velocity) / 2])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(vp.w + ruler.left + 3, wyMin * scale + ty + ruler.top);
  ctx.lineTo(vp.w + ruler.left + 3, wyMax * scale + ty + ruler.top);
  ctx.stroke();

  ctx.save();
  const x = vp.w + ruler.left + 50;
  const y = ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + ty + ruler.top;
  ctx.translate(x, y);
  ctx.font = '12px Arial';
  ctx.fillStyle = '#444';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'end';
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Глубина, м', 0, 0);
  ctx.restore();

  for (const t of ticks) {
    const wy = tToWy(t);
    const y = vp.y + (wy * scale + ty);
    const label = fmt(t);

    if (y < vp.y || y > vp.y + vp.h) continue;

    ctx.beginPath();
    ctx.moveTo(vp.w + ruler.left + 8, y);
    ctx.lineTo(vp.w + ruler.left + 3, y);
    ctx.stroke();

    ctx.font = '12px Arial';
    ctx.fillStyle = '#444';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'start';
    ctx.fillText(label, vp.w + ruler.left + 15, y);
  }
};
