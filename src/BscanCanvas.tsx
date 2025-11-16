import React, { useEffect, useMemo, useRef, useState } from 'react';
import useBscanStore from './stores/bscan-store';
import * as d3 from 'd3';

const transpose = <T,>(m: T[][]): T[][] =>
  m.length
    ? Array.from({ length: m[0].length }, (_, c) => m.map((r) => r[c]))
    : [];
type Cell = { x: number; y: number; v: number; sx: number; sy: number };

const makeLUT = (): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const r = t < 0.5 ? 0 : (t - 0.5) * 2 * 255;
    const b = t > 0.5 ? 0 : (0.5 - t) * 2 * 255;
    const g = (1 - Math.abs(t - 0.5) * 2) * 255;
    const k = i * 4;
    lut[k] = r;
    lut[k + 1] = g;
    lut[k + 2] = b;
    lut[k + 3] = 255;
  }
  return lut;
};

export default function BscanCanvas({
  rotated = false,
}: {
  rotated?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgD3Ref =
    useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>(null);
  const viewportRef = useRef<HTMLDivElement>(null); // scrollable area
  const baseRef = useRef<HTMLCanvasElement>(null); // heatmap canvas
  const overlayRef = useRef<HTMLCanvasElement>(null); // overlay canvas
  const svgAxesRef = useRef<SVGSVGElement>(null); // axes

  const bscan = useBscanStore((s) => s.bscan);
  const dx = useBscanStore((s) => s.dx);
  const dt = useBscanStore((s) => s.dt);

  const lut = useMemo(makeLUT, []);
  const heightPx = 500;

  const [scale, setScale] = useState(1);

  const margin = { top: 24, right: 56, bottom: 24, left: 56 };

  const z = useMemo(
    () => (rotated ? transpose(bscan) : bscan),
    [bscan, rotated]
  );

  const rows = z.length || 0;
  const cols = rows ? z[0].length : 0;

  const domain = useMemo<[number, number]>(() => {
    const minmaxes = bscan.map((ascan) => ({
      min: Math.min(...ascan),
      max: Math.max(...ascan),
    }));
    const min = Math.min(...minmaxes.map((m) => m.min));
    const max = Math.max(...minmaxes.map((m) => m.max));
    return [min, max];
  }, [z, bscan]);

  const offscreen = useMemo(() => {
    if (!rows || !cols) return null;
    const [vmin, vmax] = domain;
    const scale = 255 / (vmax - vmin || 1);

    const cv = document.createElement('canvas');
    cv.width = cols;
    cv.height = rows;
    const ctx = cv.getContext('2d', { willReadFrequently: false })!;
    const img = ctx.createImageData(cols, rows);

    let k = 0;
    for (let y = 0; y < rows; y++) {
      const row = z[y];
      for (let x = 0; x < cols; x++) {
        let v = row[x];
        if (v < vmin) v = vmin;
        else if (v > vmax) v = vmax;
        const idx = Math.max(0, Math.min(255, Math.round((v - vmin) * scale)));
        const i4 = idx * 4;
        img.data[k++] = lut[i4];
        img.data[k++] = lut[i4 + 1];
        img.data[k++] = lut[i4 + 2];
        img.data[k++] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }, [z, rows, cols, domain, lut]);

  useEffect(() => {
    if (!containerRef.current || !viewportRef.current) return;
    const ro = new ResizeObserver(() => {
      const W = containerRef.current!.clientWidth;
      const H = heightPx;
      // Inner drawing area size:
      const innerW = Math.max(10, W - margin.left - margin.right);
      const innerH = Math.max(10, H - margin.top - margin.bottom);
      // Square pixels: vertical fit determines px-per-sample
      const s = rows ? innerH / rows : 1;
      setScale(s);
      // Sync canvas CSS sizes
      layoutCanvases(innerW, innerH, s);
      // drawAxes(innerW, innerH, s);
      render(innerW, innerH, s);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols, heightPx]);

  const render = (innerW: number, innerH: number, s: number) => {
    if (!offscreen || !baseRef.current || !viewportRef.current) return;

    const ctx = baseRef.current.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    // Clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, baseRef.current.width, baseRef.current.height);
    ctx.imageSmoothingEnabled = false;

    // Visible window in data columns based on scrollLeft
    const scrollLeft = viewportRef.current.scrollLeft;
    const startCol = Math.max(0, Math.floor(scrollLeft / s));
    const visCols = Math.min(cols - startCol, Math.ceil(innerW / s) + 1);

    // Device pixel scaling
    ctx.scale(dpr, dpr);

    // Source crop (data space), destination size (screen space)
    ctx.drawImage(
      offscreen,
      startCol, // sx
      0, // sy
      visCols, // sw
      rows, // sh
      0, // dx
      0, // dy
      visCols * s, // dw
      rows * s // dh
    );
  };

  const layoutCanvases = (innerW: number, innerH: number, s: number) => {
    const dpr = window.devicePixelRatio || 1;

    // Visible canvases are viewport-sized (innerW x innerH)
    for (const cv of [baseRef.current!, overlayRef.current!]) {
      cv.style.width = `${innerW}px`;
      cv.style.height = `${innerH}px`;
      cv.width = Math.round(innerW * dpr);
      cv.height = Math.round(innerH * dpr);
    }

    // Content width in the scrollable viewport = cols * s (square pixels)
    if (viewportRef.current) {
      const content = viewportRef.current.firstElementChild as HTMLDivElement;
      content.style.width = `${cols * s}px`;
      content.style.height = `${rows * s}px`;
    }

    // Position the canvas pair within the big content area
    const holder = overlayRef.current!.parentElement as HTMLDivElement;
    holder.style.width = `${cols * s}px`;
    holder.style.height = `${rows * s}px`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const handle = () => {
      const W = containerRef.current!.clientWidth;
      const H = heightPx;
      const innerW = Math.max(10, W - margin.left - margin.right);
      const innerH = Math.max(10, H - margin.top - margin.bottom);
      render(innerW, innerH, scale);
      drawAxes(innerW, innerH, scale);
      drawOverlay(innerW, innerH, scale); // if you draw picks/hyperbolas
    };

    viewportRef.current?.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);
    handle();

    return () => {
      viewportRef.current?.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, offscreen, rows, cols, dx, dt]);

  // Axes drawing (top/left/right). They stay sticky; ticks depend on scale & scroll.
  const drawAxes = (innerW: number, innerH: number, s: number) => {
    const svg = d3.select(svgAxesRef.current!);
    svg.selectAll('*').remove();

    const gTop = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    const gLeft = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    const gRight = svg
      .append('g')
      .attr('transform', `translate(${margin.left + innerW},${margin.top})`);

    // Current horizontal window (in columns)
    const scrollLeft = viewportRef.current?.scrollLeft ?? 0;
    const startCol = Math.max(0, scrollLeft / s);
    const endCol = startCol + innerW / s;

    // Scales for axes (domain in samples/cols, range in px)
    const xScale = d3
      .scaleLinear()
      .domain([startCol, endCol])
      .range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0, rows]).range([0, innerH]);

    const xAxis = d3
      .axisTop(xScale)
      .ticks(10)
      .tickFormat((d: any) => (d * dx).toFixed(2));
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(10)
      .tickFormat((d: any) => (d * dt).toFixed(2));
    const depthAxis = d3
      .axisRight(yScale)
      .ticks(10)
      .tickFormat((d: any) => (Math.max(0, d * dt) * 1).toFixed(2));
    // .tickFormat((d: any) => (Math.max(0, (d - t0Shift) * dt) * velocity).toFixed(2));

    gTop.call(xAxis as any);
    gLeft.call(yAxis as any);
    gRight.call(depthAxis as any);

    // time-zero line markers
    const y0 = yScale(0);
    gLeft
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', y0)
      .attr('y2', y0)
      .attr('stroke', '#888');
    gRight
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', y0)
      .attr('y2', y0)
      .attr('stroke', '#888');
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return; // only zoom when Ctrl is held
      e.preventDefault();

      const viewport = viewportRef.current!;
      const mouseX = e.clientX - viewport.getBoundingClientRect().left;
      const W = containerRef.current!.clientWidth;
      const innerW = Math.max(10, W - margin.left - margin.right);
      const innerH = Math.max(10, heightPx - margin.top - margin.bottom);

      const oldS = scale;
      const oldScroll = viewport.scrollLeft;
      const colAtCursor = (oldScroll + mouseX) / oldS;

      // zoom factor
      const k = Math.exp(-e.deltaY / 300); // smooth
      const newS = Math.max(0.2, Math.min(40, oldS * k));
      setScale(newS);

      // keep cursor centered over same column
      const newScroll = colAtCursor * newS - mouseX;
      viewport.scrollLeft = Math.max(
        0,
        Math.min(cols * newS - innerW, newScroll)
      );

      layoutCanvases(innerW, innerH, newS);
      render(innerW, innerH, newS);
      // drawAxes(innerW, innerH, newS);
    };

    const vp = viewportRef.current;
    vp?.addEventListener('wheel', onWheel, { passive: false });
    return () => vp?.removeEventListener('wheel', onWheel as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, cols]);

  const drawOverlay = (innerW: number, innerH: number, s: number) => {
    if (!overlayRef.current) return;
    const ctx = overlayRef.current.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    ctx.scale(dpr, dpr);

    // Example: draw time-zero line across viewport
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    const y0 = 0; //t0Shift * s;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(innerW, y0);
    ctx.stroke();
  };

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '500px', position: 'relative' }}
    >
      {/* Axes layer (sticky) */}
      {/* Plot area */}
      <div
        style={{
          position: 'absolute',
          left: margin.left,
          right: margin.right,
          top: margin.top,
          bottom: margin.bottom,
          overflowX: 'auto',
          overflowY: 'hidden',
          // prevent parent scrolling on wheel while Ctrl is pressed
          overscrollBehavior: 'contain',
        }}
        ref={viewportRef}
      >
        {/* Big content sized to cols*s x rows*s */}
        <div style={{ position: 'relative' }}>
          {/* Base heatmap */}
          <canvas
            ref={baseRef}
            style={{ position: 'absolute', left: 0, top: 0 }}
          />
          {/* Overlay drawings */}
          <canvas
            ref={overlayRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
