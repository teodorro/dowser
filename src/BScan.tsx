import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import useBscanStore from './stores/bscan-store';

const transpose = <T,>(m: T[][]): T[][] => {
  if (!m.length) return [];
  const rows = m.length,
    cols = m[0].length;
  const out = Array.from({ length: cols }, () => Array<T>(rows));
  for (let r = 0; r < rows; r++) {
    const row = m[r];
    for (let c = 0; c < cols; c++) out[c][r] = row[c];
  }
  return out;
};

export default function Bscan({ rotated = false }: { rotated?: boolean }) {
  const bscan = useBscanStore((s) => s.bscan);

  const zView = useMemo(
    () => (rotated ? transpose(bscan) : bscan),
    [bscan, rotated]
  );

  return (
    <div style={{ width: '100%', height: '80%', border: '1px solid #a00' }}>
      <Plot
        data={[
          {
            z: zView,
            type: 'heatmap',
          } as Partial<Plotly.PlotData>,
        ]}
        layout={{
          autosize: true,
          dragmode: 'pan',
          margin: { t: 36, r: 12, b: 36, l: 56 },
          xaxis: {
            domain: [0, 0.9],
            side: 'top',
            scaleanchor: 'y',
            scaleratio: 1,
            constrain: 'domain',
            title: {
              text: rotated ? 'Длина' : 'Время',
              standoff: 8,
            },
          },
          yaxis: {
            domain: [0, 1],
            constrain: 'domain',
            autorange: 'reversed',
            ticks: 'outside',
            showticklabels: true,
            title: {
              text: rotated ? 'Время' : 'Глубина',
              standoff: 8,
            },
          },
          uirevision: 'keep',
        }}
        config={{
          scrollZoom: true, // <-- wheel / trackpad zoom
          doubleClick: false,
          displayModeBar: true,
          modeBarButtonsToRemove: ['zoom2d', 'select2d', 'lasso2d'], // optional cleanup
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  );
}
