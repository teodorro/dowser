import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import useBscanStore from '../stores/bscan-store';
import useVisualSettingsStore from '../stores/visual-settings-store';
import getPalette from './get-palette';
import { logAmplitude } from '../processing/visual-processing/log-amplitude';
import * as d3 from 'd3';
import {
  fftFreqAxisHalf,
  getFftBscan,
} from '../processing/data-processing/fft-bscan';

const clamp = (v: number, a: number, b: number) => {
  return Math.max(a, Math.min(b, v));
};

export default function BscanFftCanvas() {
  const DEFAULT_SCALE = 2;

  const bscanFft = useBscanStore.use.bscanFft();
  const bscanToShow = useBscanStore.use.bscanToShow();
  const bscanFullAmp = useBscanStore.use.bscanFullAmp();
  const bscan = useBscanStore.use.bscan();
  const dt = useBscanStore.use.dt();
  const dx = useBscanStore.use.dx();

  const setBscanToShow = useBscanStore.use.setBscanToShow();
  const setIndexAscan = useBscanStore.use.setIndexAscan();
  const setIndexT = useBscanStore.use.setIndexT();
  const setBscanFft = useBscanStore.use.setBscanFft();

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

  // Build an ImageBitmap once per bscan (fast to draw).
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const dims = useMemo(() => {
    const cols = bscanToShow.length;
    const rows = cols ? bscanToShow[0].length : 0;
    return { rows, cols };
  }, [bscanToShow]);

  const logAmplitudeSelectedSpectrum =
    useVisualSettingsStore.use.logAmplitudeSelectedSpectrum();
  const selectedPaletteSpectrum =
    useVisualSettingsStore.use.selectedPaletteSpectrum();

  const ruler = { left: 56, top: 46, right: 0, bottom: 0 };

  const vpRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const lut = useMemo(() => {
    return getPalette(selectedPaletteSpectrum);
  }, [selectedPaletteSpectrum]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => redrawRef.current());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    lastX.current = 0;
    lastY.current = 0;
    setScale(DEFAULT_SCALE);
    setTx(0);
    setTy(0);
  }, [bscanFullAmp]);

  useEffect(() => {
    setBscanFft(getFftBscan(bscan).bscan);
  }, [bscan]);

  useEffect(() => {
    setBscanToShow(bscanFft);
  }, [bscanFft]);

  useEffect(() => {
    let data = bscanFft;
    if (logAmplitudeSelectedSpectrum) {
      data = logAmplitude(data);
    }
    setBscanToShow(data);
  }, [bscanFft, logAmplitudeSelectedSpectrum]);

  useEffect(() => {
    if (!bscanToShow.length) return;
    const min = Math.min(
      ...bscanToShow.map((ascan) =>
        ascan.reduce((min, value) => Math.min(min, value), Infinity),
      ),
    );
    const max = Math.max(
      ...bscanToShow.map((ascan) =>
        ascan.reduce((max, value) => Math.max(max, value), -Infinity),
      ),
    );
    setValueRange({ min, max });
  }, [bscanToShow]);

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
          const col = bscanToShow[y];
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
          const v = bscanToShow[x][y];
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

      redraw();
    }

    buildBitmap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bscanToShow, dims.rows, dims.cols, valueRange, lut]);

  // Redraw when view changes
  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, tx, ty, dx]);

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
  }, [scale, tx, ty]);

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
    const cols = bscanFft.length;
    const rows = fftFreqAxisHalf(bscanFft[0].length, dt);

    const wyMin = clamp((0 - ty) / scale, 0, rows.length);
    const wyMax = clamp((vp.h - ty) / scale, 0, rows.length);
    const wxMin = clamp((0 - tx) / scale, 0, cols);
    const wxMax = clamp((vp.w - tx) / scale, 0, cols);

    drawFrequencyRuler(ctx, wyMin, wyMax, rows);
    drawLengthRuler(ctx, wxMin, wxMax);
  };

  const drawLengthRuler = (
    ctx: CanvasRenderingContext2D,
    wxMin: number,
    wxMax: number,
  ) => {
    const rows = bscanFft.length;
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

  const drawFrequencyRuler = (
    ctx: CanvasRenderingContext2D,
    wyMin: number,
    wyMax: number,
    freqAxis: number[],
  ) => {
    const rows = bscanFft[0].length;
    const vp = vpRef.current;
    const fVisMin = freqAxis[Math.floor(wyMin)];
    const fVisMax = freqAxis[Math.floor(wyMax - 1)];

    const minLabelPx = 24;
    const maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
    const ticks = d3.ticks(fVisMin, fVisMax, maxTicks);
    const step = d3.tickStep(fVisMin, fVisMax, maxTicks);
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
    const fmf = d3.format(`.${decimals}f`);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, vp.y, ruler.left, vp.h);

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;

    const tToWy = d3
      .scaleLinear()
      .domain([freqAxis[0], freqAxis[freqAxis.length - 1]])
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
    ctx.fillText('Частота, МГц', 0, 0);
    ctx.restore();

    for (const t of ticks) {
      const wy = tToWy(t);
      const y = vp.y + (wy * scale + ty);
      const label = fmf(t);

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
