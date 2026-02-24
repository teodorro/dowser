import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
const Plot = createPlotlyComponent(Plotly);
import useBscanStore from '../stores/bscan-store';
import useVisualSettingsStore from '../stores/visual-settings-store';
import { logAmplitude } from '../processing/visual-processing/log-amplitude';

const transpose = <T,>(m: T[][]): T[][] =>
  m.length
    ? Array.from({ length: m[0].length }, (_, c) => m.map((r) => r[c]))
    : [];

export default function BscanFft({ rotated = false }: { rotated?: boolean }) {
  const m = { t: 36, r: 12, b: 36, l: 56 };

  // const bscan = useBscanStore.use.bscan();
  const bscanFft = useBscanStore.use.bscanFft();
  const bscanToShow = useBscanStore.use.bscanToShow();
  const dx = useBscanStore.use.dx();
  const dt = useBscanStore.use.dt();
  const velocity = useBscanStore.use.velocity();
  const selectedYAxis = useBscanStore.use.selectedYAxis();

  const setBscanToShow = useBscanStore.use.setBscanToShow();
  const setAscanInd = useBscanStore.use.setIndexAscan();

  const logAmplitudeSelected =
    useVisualSettingsStore.use.logAmplitudeSelected();

  const z = useMemo(
    () => (rotated ? transpose(bscanToShow) : bscanToShow),
    [bscanToShow, rotated],
  );

  const hostRef = useRef<HTMLDivElement>(null);
  const [hostH, setHostH] = useState(400);
  const [yTickVals, setYTickVals] = useState<number[]>([]);
  const [yTickText, setYTickText] = useState<string[]>([]);

  const rows = z.length || 0;
  const cols = rows ? z[0].length : 0;
  const cellPx = rows ? (hostH - m.t - m.b) / rows : 8;

  useLayoutEffect(() => {
    if (!hostRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = Math.max(120, Math.floor(entry.contentRect.height));
      setHostH(h);
    });
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, []);

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

  useEffect(() => {
    const vals: number[] = [];
    const text: string[] = [];
    if (selectedYAxis === 'time') {
      for (let i = 0; i < rows; i += 10) {
        const val = Number.parseFloat((i * dt).toFixed(1));
        vals.push(i);
        text.push(val.toString());
      }
      setYTickVals(vals);
      setYTickText(text);
    } else if (selectedYAxis === 'depth') {
      for (let d = 0; ; d += 1) {
        const i = Number.parseFloat((d / dt / velocity).toFixed(0));
        if (vals.every((x) => x !== i && x + 9 < i)) {
          vals.push(i);
          text.push(d.toString());
        }
        if (i > rows) break;
      }
      setYTickVals(vals);
      setYTickText(text);
    }
  }, [bscanFft, selectedYAxis, velocity, dt]);

  useEffect(() => {
    let data = bscanFft;
    if (logAmplitudeSelected) {
      data = logAmplitude(data);
    }
    setBscanToShow(data);
  }, [bscanFft, logAmplitudeSelected]);

  const onHover = (event: Readonly<Plotly.PlotHoverEvent>) => {
    const inds = event.xvals;
    if (inds != null && inds.length > 0) {
      let ind = Number.parseInt((inds[0] as number).toFixed(0));
      ind = Math.max(0, ind);
      ind = Math.min(ind, bscanFft.length - 1);
      setAscanInd(ind);
    }
  };

  return (
    <div
      ref={hostRef}
      style={{
        width: '100%',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      <div
        style={{
          width: plotW,
          height: plotH,
        }}
      >
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
            // width: Math.max(plotW, hostRef.current?.clientWidth),
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
          onHover={onHover}
        />
      </div>
    </div>
  );
}
