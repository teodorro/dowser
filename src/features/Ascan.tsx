import { useEffect, useMemo, useState } from 'react';
import useBscanStore from '../stores/bscan-store';
import * as echarts from 'echarts/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { Box } from '@mui/material';
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  TitleComponent,
  ToolboxComponent,
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  TitleComponent,
  CanvasRenderer,
  DataZoomComponent,
  ToolboxComponent,
]);

export default function Ascan() {
  const bscanToShow = useBscanStore.use.bscanToShow();
  const indexAscan = useBscanStore.use.indexAscan();
  const selectedYAxis = useBscanStore.use.selectedYAxis();
  const velocity = useBscanStore.use.velocity();
  const dt = useBscanStore.use.dt();

  const [yLabels, setYLabels] = useState<number[]>([]);

  const minBscan = useMemo(
    () => Math.min(...bscanToShow.map((x) => Math.min(...x))),
    [bscanToShow],
  );

  const maxBscan = useMemo(
    () => Math.max(...bscanToShow.map((x) => Math.max(...x))),
    [bscanToShow],
  );

  const data = useMemo(() => {
    if (!bscanToShow.length || indexAscan == null) return [];
    if (bscanToShow[indexAscan] == null) {
      return [];
    }
    const a = [...bscanToShow[indexAscan].entries()].map(([idx, val]) => [
      val,
      bscanToShow[indexAscan].length - idx - 1,
    ]);
    return a;
  }, [bscanToShow, indexAscan]);

  useEffect(() => {
    if (bscanToShow.length === 0 || indexAscan == null) {
      setYLabels([]);
    } else if (selectedYAxis === 'time') {
      const labels = bscanToShow[indexAscan]
        .map((_, idx) => Number.parseFloat(idx.toFixed(2)) * dt)
        .reverse();
      setYLabels(labels);
    } else if (selectedYAxis === 'depth') {
      const labels = bscanToShow[indexAscan]
        .map((_, idx) => Number.parseFloat((idx * dt * velocity).toFixed(1)))
        .reverse();
      setYLabels(labels);
    } else {
      setYLabels([]);
    }
  }, [bscanToShow, selectedYAxis, velocity]);

  const option = useMemo<echarts.EChartsCoreOption>(() => {
    const n = data.length || 0;
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      toolbox: {
        feature: {
          dataZoom: {
            xAxisIndex: 'none',
            yAxisIndex: 0,
          },
          restore: {},
          saveAsImage: {},
        },
      },
      xAxis: {
        type: 'value',
        min: minBscan,
        max: maxBscan,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: Math.max(0, n - 1),
        axisLabel: {
          formatter: (v: number) => {
            const i = Math.round(v);
            const lab = yLabels[i];
            return lab == null ? '' : String(lab);
          },
        },
      },
      dataZoom: [
        {
          type: 'inside',
          yAxisIndex: 0,
        },
        {
          type: 'slider',
          yAxisIndex: 0,
        },
      ],
      series: [
        {
          name: 'A-scan',
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color: '#444',
          },
          data,
        },
      ],
    };
  }, [data, yLabels]);

  return (
    <Box
      sx={{
        width: '25em',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        borderLeft: '2px solid #444',
        border: '1px solid #a00',
      }}
    >
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge
        lazyUpdate
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
}
