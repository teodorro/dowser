import { useEffect, useMemo, useRef, useState } from 'react';
import useBscanStore from '../stores/bscan-store';
import useVisualSettingsStore from '../stores/visual-settings-store';
import { logAmplitude } from '../processing/visual-processing/log-amplitude';
import useDataProcessorStore from '../stores/data-processor-store';
import getPalette from './get-palette';
import { Box } from '@mui/material';
import * as d3 from 'd3';

const clamp = (v: number, a: number, b: number) => {
  return Math.max(a, Math.min(b, v));
};

export default function BscanCanvas() {
  const bscan = useBscanStore.use.bscan();
  const bscanToShow = useBscanStore.use.bscanToShow();
  const bscanFullAmp = useBscanStore.use.bscanFullAmp();
  const dt = useBscanStore.use.dt();
  // const velocity = useBscanStore.use.velocity();
  // const dx = useBscanStore.use.dx();

  const setBscan = useBscanStore.use.setBscan();
  const setBscanToShow = useBscanStore.use.setBscanToShow();
  const setIndexAscan = useBscanStore.use.setIndexAscan();
  const setIndexT = useBscanStore.use.setIndexT();

  const operations = useDataProcessorStore.use.operations();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [scale, setScale] = useState(1);
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

  const logAmplitudeSelected =
    useVisualSettingsStore.use.logAmplitudeSelected();
  const logAmplitudeSelected2 =
    useVisualSettingsStore.use.logAmplitudeSelected2();
  const selectedPalette = useVisualSettingsStore.use.selectedPalette();

  const ruler = { left: 56, top: 32, right: 56, bottom: 0 };

  const vpRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const lut = useMemo(() => {
    return getPalette(selectedPalette);
  }, [selectedPalette]);

  useEffect(() => {
    const data = bscanFullAmp;
    setBscan(data);
    lastX.current = 0;
    lastY.current = 0;
    setScale(1);
    setTx(0);
    setTy(0);
    // setTx(ruler.left);
    // setTy(ruler.top);
  }, [bscanFullAmp, operations]);

  useEffect(() => {
    let data = bscan;
    if (logAmplitudeSelected) {
      data = logAmplitude(data);
    }
    if (logAmplitudeSelected2) {
      data = logAmplitude(data);
    }
    setBscanToShow(data);
  }, [bscan, logAmplitudeSelected, logAmplitudeSelected2]);

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
        for (let y = 0; y < rows; y++) {
          const row = bscanToShow[y];
          for (let x = 0; x < cols; x++) {
            const v = row[x];
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
  }, [scale, tx, ty]);

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

    // Keep canvas crisp on HiDPI
    // const w = Math.floor(cssW);
    // const h = Math.floor(cssH);
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

      // Apply pan/zoom; note dpr scale so tx/ty are in CSS pixels
      // ctx.setTransform(scale * dpr, 0, 0, scale * dpr, tx * dpr, ty * dpr);
      // ctx.setTransform(scale, 0, 0, scale, vp.x + tx, vp.y + ty);
      ctx.save();
      ctx.translate(vp.x + tx, vp.y + ty); // CSS px
      ctx.scale(scale, scale); // CSS px
      // Draw the “image” at world origin (0,0)
      ctx.drawImage(bmp, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    drawRulers(ctx);

    // console.log(
    //   'vp.w',
    //   vp.w,
    //   'vp.h',
    //   vp.h,
    //   'vp.x',
    //   vp.x,
    //   'vp.y',
    //   vp.y,
    //   'tx',
    //   tx,
    //   'ty',
    //   ty,
    // );
    // console.log('start x', (vp.x + tx) * dx, 'start t', (vp.y + ty) * dt);
  };

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
    const tMin = 0;
    const tMax = bscan[0].length * dt;
    const tMinPx = 0;
    const tMaxPx = bitmapRef.current?.height ?? 0;

    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, vp.y, ruler.left, vp.h);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    const tScale = d3
      .scaleLinear()
      .domain([tMin, tMax])
      .range([tMinPx, tMaxPx]);
    for (let i = 0; i < bscan[0].length; i += 25 * Math.log(scale + 1)) {
      const t = i * dt;
      const px = tScale(t);
      if (px * scale + ty < 0) continue;
      ctx.beginPath();
      ctx.moveTo(43, px * scale + ty + ruler.top);
      ctx.lineTo(53, px * scale + ty + ruler.top);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.stroke();

      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'end';
      ctx.fillText(String(Math.round(t)), 40, px * scale + ty + ruler.top);
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
