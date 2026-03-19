import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import useBscanStore from '../../stores/bscan-store';
import useAttributesStore from '../../stores/attributes-store';
import getPalette from '../get-palette';
import useVisualSettingsStore from '../../stores/visual-settings-store';
import unreachable from '../../utils/unreachable';
import useUiStore from '../../stores/ui-store';

const clamp = (v: number, a: number, b: number) => {
  return Math.max(a, Math.min(b, v));
};

export default function AttributesScan() {
  const DEFAULT_SCALE = 2;
  const bscan = useBscanStore.use.bscan();
  const dt = useBscanStore.use.dt();
  const dx = useBscanStore.use.dx();
  const velocity = useBscanStore.use.velocity();

  const setIndexAscan = useBscanStore.use.setIndexAscan();
  const setIndexT = useBscanStore.use.setIndexT();

  const setIsLoading = useUiStore.use.setIsLoading();

  const windowSize = useAttributesStore.use.windowSize();
  const selectedAttribute = useAttributesStore.use.selectedAttribute();
  const peakFrequencies = useAttributesStore.use.peakFrequencies();
  const spectrumWidths = useAttributesStore.use.spectrumWidths();
  const qualityFactors = useAttributesStore.use.qualityFactors();
  const coherence = useAttributesStore.use.coherence();
  const scanToShow = useAttributesStore.use.scanToShow();

  const setPeakFrequencies = useAttributesStore.use.setPeakFrequencies();
  const setSpectrumWidths = useAttributesStore.use.setSpectrumWidths();
  const setQualityFactors = useAttributesStore.use.setQualityFactors();
  const setCoherence = useAttributesStore.use.setCoherence();
  const setScanToShow = useAttributesStore.use.setScanToShow();

  const selectedPaletteAttributes =
    useVisualSettingsStore.use.selectedPaletteAttributes();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const redrawRef = useRef<() => void>(() => {});

  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef<boolean>(false);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const [valueRange, setValueRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  const bitmapRef = useRef<ImageBitmap | null>(null);

  const dims = useMemo(() => {
    const cols = scanToShow.length;
    const rows = cols ? scanToShow[0].length : 0;
    return { rows, cols };
  }, [scanToShow]);

  const ruler = { left: 56, top: 46, right: 66, bottom: 0 };

  const vpRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const workerRef = useRef<Worker | null>(null);

  const lut = useMemo(() => {
    return getPalette(selectedPaletteAttributes);
  }, [selectedPaletteAttributes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => redrawRef.current());
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL('../attributes/attributes-worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (
      e: MessageEvent<{
        type:
          | 'peakFrequencies'
          | 'spectrumWidths'
          | 'qualityFactors'
          | 'coherence';
        result: number[][];
      }>,
    ) => {
      if (e.data.type === 'peakFrequencies') {
        setPeakFrequencies(e.data.result);
      } else if (e.data.type === 'spectrumWidths') {
        setSpectrumWidths(e.data.result);
      } else if (e.data.type === 'qualityFactors') {
        setQualityFactors(e.data.result);
      } else if (e.data.type === 'coherence') {
        setCoherence(e.data.result);
      }

      setIsLoading(false);
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    runAnalysis();
  }, [bscan, windowSize, dt]);

  useEffect(() => {
    switch (selectedAttribute) {
      case 'peakFrequencies':
        setScanToShow(peakFrequencies);
        break;
      case 'spectrumWidths':
        setScanToShow(spectrumWidths);
        break;
      case 'qualityFactors':
        setScanToShow(qualityFactors);
        break;
      case 'coherence':
        setScanToShow(coherence);
        break;
      default:
        unreachable(selectedAttribute);
        break;
    }
  }, [
    selectedAttribute,
    peakFrequencies,
    spectrumWidths,
    qualityFactors,
    coherence,
  ]);

  useEffect(() => {
    if (!scanToShow.length) return;
    const min = Math.min(
      ...scanToShow.map((ascan) =>
        ascan.reduce((min, value) => Math.min(min, value), Infinity),
      ),
    );
    const max = Math.max(
      ...scanToShow.map((ascan) =>
        ascan.reduce((max, value) => Math.max(max, value), -Infinity),
      ),
    );
    setValueRange({ min, max });
  }, [scanToShow]);

  useEffect(() => {
    let cancelled = false;

    async function buildBitmap() {
      const { rows, cols } = dims;
      if (!rows || !cols) {
        bitmapRef.current = null;
        redraw();
        return;
      }

      let min = valueRange?.min ?? Infinity;
      let max = valueRange?.max ?? -Infinity;
      if (!valueRange) {
        for (let y = 0; y < cols; y++) {
          const col = scanToShow[y];
          for (let x = 0; x < rows; x++) {
            const v = col[x];
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
        if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
          min = 0;
          max = 1;
        }
      }

      const inv = 1 / (max - min);

      const img = new ImageData(cols, rows);
      const data = img.data;
      let p = 0;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = scanToShow[x][y];
          const t = clamp((v - min) * inv, 0, 1);
          const idx = (t * 255) | 0;
          const o = idx * 4;
          data[p++] = lut[o + 0];
          data[p++] = lut[o + 1];
          data[p++] = lut[o + 2];
          data[p++] = 255;
        }
      }

      const off = document.createElement('canvas');
      off.width = cols;
      off.height = rows;
      const offCtx = off.getContext('2d');
      if (!offCtx) return;
      offCtx.putImageData(img, 0, 0);

      const bmp = await createImageBitmap(off);
      if (cancelled) {
        bmp.close();
        return;
      }

      bitmapRef.current?.close?.();
      bitmapRef.current = bmp;

      requestAnimationFrame(() => redraw());
    }

    buildBitmap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanToShow, dims.rows, dims.cols, valueRange, lut]);

  // Redraw when view changes
  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, tx, ty, dx, dt]);

  // Mouse interactions: pan + wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: MouseEvent) => {
      dragging.current = true;
      const { sx, sy } = toViewportLocal(e, canvas);
      lastX.current = sx;
      lastY.current = sy;
    };
    const onMove = (e: MouseEvent) => {
      const { sx, sy } = toViewportLocal(e, canvas);
      const inds = getBscanIndexFromMouse(e);
      setIndexAscan(inds?.col);
      setIndexT(inds?.row);
      if (!dragging.current) return;
      const dx = sx - lastX.current;
      const dy = sy - lastY.current;
      lastX.current = sx;
      lastY.current = sy;
      setTx((v) => v + dx);
      setTy((v) => v + dy);
    };
    const onUp = () => {
      dragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left; // mouse in CSS px
      const py = e.clientY - rect.top;
      const mx = px - vpRef.current.x; // viewport-local
      const my = py - vpRef.current.y; // viewport-local

      // Zoom factor
      const zoom = Math.exp(-e.deltaY * 0.001);
      setScale((old) => {
        const next = clamp(old * zoom, 0.1, 40);

        // Zoom around cursor: adjust tx/ty so the point under cursor stays put
        // world = (screen - t) / scale
        const wx = (mx - tx) / old;
        const wy = (my - ty) / old;
        setTx(mx - wx * next);
        setTy(my - wy * next);

        return next;
      });
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [scale, tx, ty, dims]);

  const toViewportLocal = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    return { sx: px - vpRef.current.x, sy: py - vpRef.current.y };
  };

  // Redraw function (draw bitmap with current transform)
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    if (cssW <= 0 || cssH <= 0) {
      requestAnimationFrame(() => redrawRef.current());
      return;
    }

    const w = Math.floor(cssW * dpr);
    const h = Math.floor(cssH * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const vp = {
      x: ruler.left,
      y: ruler.top,
      w: cssW - ruler.left - ruler.right,
      h: cssH - ruler.top - ruler.bottom,
    };
    vpRef.current = vp;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    ctx.save();
    ctx.beginPath();
    ctx.rect(vp.x, vp.y, vp.w, vp.h);
    ctx.clip();

    const bmp = bitmapRef.current;

    if (bmp) {
      ctx.imageSmoothingEnabled = false;

      ctx.save();
      ctx.translate(vp.x + tx, vp.y + ty);
      ctx.scale(scale, scale);
      // Draw the “image” at world origin (0,0)
      ctx.drawImage(bmp, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    drawRulers(ctx);
  };

  redrawRef.current = redraw;

  const getBscanIndexFromMouse = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left; // canvas-local CSS px
    const py = e.clientY - rect.top;

    // viewport-local screen
    const sx = px - vpRef.current.x;
    const sy = py - vpRef.current.y;

    const wx = (sx - tx) / scale;
    const wy = (sy - ty) / scale;

    const col = Math.floor(wx);
    const row = Math.floor(wy);

    const { rows, cols } = dims; // rows = bitmap height, cols = bitmap width
    if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
    if (sx < 0 || sy < 0 || sx > vpRef.current.w || sy > vpRef.current.h)
      return null;

    return { col, row, wx, wy, px, py };
  };

  const drawRulers = (ctx: CanvasRenderingContext2D) => {
    if (bscan == null || bscan.length === 0) return;
    const vp = vpRef.current;
    const rows = bscan[0].length;
    const cols = bscan.length;

    const wyMin = clamp((0 - ty) / scale, 0, rows);
    const wyMax = clamp((vp.h - ty) / scale, 0, rows);
    const wxMin = clamp((0 - tx) / scale, 0, cols);
    const wxMax = clamp((vp.w - tx) / scale, 0, cols);

    drawTimeRuler(ctx, wyMin, wyMax);
    drawLengthRuler(ctx, wxMin, wxMax);
    drawDepthRuler(ctx, wyMin, wyMax);
  };

  const drawLengthRuler = (
    ctx: CanvasRenderingContext2D,
    wxMin: number,
    wxMax: number,
  ) => {
    const rows = bscan.length;
    const vp = vpRef.current;
    const xVisMin = wxMin * dx;
    const xVisMax = wxMax * dx;

    const minLabelPx = 131;
    const maxTicks = Math.max(2, Math.floor(vp.w / minLabelPx));
    const ticks = d3.ticks(xVisMin, xVisMax, maxTicks);
    const step = d3.tickStep(xVisMin, xVisMax, maxTicks);
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
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
  ) => {
    const rows = bscan[0].length;
    const vp = vpRef.current;
    const tVisMin = wyMin * dt;
    const tVisMax = wyMax * dt;

    const minLabelPx = 24;
    const maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
    const ticks = d3.ticks(tVisMin, tVisMax, maxTicks);
    const step = d3.tickStep(tVisMin, tVisMax, maxTicks);
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
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
  ) => {
    const rows = bscan[0].length;
    const vp = vpRef.current;
    const tVisMin = (wyMin * dt * velocity) / 2;
    const tVisMax = (wyMax * dt * velocity) / 2;

    const minLabelPx = 34;
    const maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
    const ticks = d3.ticks(tVisMin, tVisMax, maxTicks);
    const step = d3.tickStep(tVisMin, tVisMax, maxTicks);
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
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

  const runAnalysis = () => {
    if (!bscan.length) return;

    setIsLoading(true);

    workerRef.current?.postMessage({
      type: selectedAttribute,
      bscan,
      dt,
      windowSize,
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'grab',
          background: '#fff',
        }}
      />
    </Box>
  );
}
