import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
const Plot = createPlotlyComponent(Plotly);
import useBscanStore from './stores/bscan-store';

const transpose = <T,>(m: T[][]): T[][] =>
  m.length
    ? Array.from({ length: m[0].length }, (_, c) => m.map((r) => r[c]))
    : [];

export default function Bscan({ rotated = false }: { rotated?: boolean }) {
  const bscan = useBscanStore((s) => s.bscan);
  const dx = useBscanStore((s) => s.dx);
  const dt = useBscanStore((s) => s.dt);

  const z = useMemo(
    () => (rotated ? transpose(bscan) : bscan),
    [bscan, rotated]
  );

  const rows = z.length || 0;
  const cols = rows ? z[0].length : 0;

  const hostRef = useRef<HTMLDivElement>(null);
  const [hostH, setHostH] = useState(400);

  useLayoutEffect(() => {
    if (!hostRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = Math.max(120, Math.floor(entry.contentRect.height));
      setHostH(h);
    });
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, []);

  const m = { t: 36, r: 12, b: 36, l: 56 };

  const cellPx = rows ? (hostH - m.t - m.b) / rows : 8;

  const plotW = Math.max(200, Math.floor(cellPx * cols + m.l + m.r));
  const plotH = hostH;

  const x = useMemo(() => Array.from({ length: cols }, (_, i) => i), [cols]);
  const y = useMemo(() => Array.from({ length: rows }, (_, i) => i), [rows]);

  const everyX = 10;
  const xTickVals = [];
  const xTickText = [];
  for (let i = 0; i < cols; i += everyX) {
    xTickVals.push(i);
    xTickText.push((i * dx).toFixed(0));
  }

  const everyY = 10;
  const yTickVals = [];
  const yTickText = [];
  for (let i = 0; i < rows; i += everyY) {
    yTickVals.push(i);
    yTickText.push((i * dt).toFixed(0));
  }

  return (
    <div
      ref={hostRef}
      style={{
        width: 'calc(100% - 15em)',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      <div style={{ width: plotW, height: plotH }}>
        <Plot
          data={[
            {
              type: 'heatmap',
              z,
              x,
              y,
              colorscale: 'Jet',
              showscale: false,
              zsmooth: false,
            } as Partial<Plotly.PlotData>,
          ]}
          layout={{
            width: plotW,
            height: plotH,
            dragmode: 'pan',
            margin: m,
            xaxis: {
              domain: [0, 1],
              side: 'top',
              scaleanchor: 'y',
              scaleratio: 1,
              constrain: 'domain',
              title: { text: rotated ? 'Длина' : 'Время', standoff: 8 },
              // optional: start from the leftmost visible “viewport” equal to host width
              // range: [0, Math.ceil((plotW - m.l - m.r) / cellPx)],
              tickmode: 'array',
              tickvals: xTickVals,
              ticktext: xTickText,
            },
            yaxis: {
              domain: [0, 1],
              autorange: 'reversed',
              constrain: 'domain',
              ticks: 'outside',
              title: { text: rotated ? 'Время' : 'Глубина', standoff: 8 },
              tickmode: 'array',
              tickvals: yTickVals,
              ticktext: yTickText,
            },
            uirevision: 'keep',
          }}
          config={{
            scrollZoom: true,
            doubleClick: false,
            displayModeBar: true,
            modeBarButtonsToRemove: ['zoom2d', 'select2d', 'lasso2d'],
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={false}
        />
      </div>
    </div>
  );
}
