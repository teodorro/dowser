import React, { useMemo } from 'react';
import useBscanStore from './stores/bscan-store';
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
  const bscan = useBscanStore((s) => s.bscan);

  const data = useMemo(() => {
    if (!bscan.length) return [];
    const a = [...bscan[0].entries()].map(([idx, val]) => [
      val,
      bscan[0].length - idx - 1,
    ]);
    return a;
  }, [bscan]);

  const yLabels = useMemo(
    () => (bscan.length ? bscan[0].map((_, idx) => idx).reverse() : []),
    [bscan]
  );

  const option = useMemo<echarts.EChartsCoreOption>(() => {
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
        boundaryGap: [0, '100%'],
      },
      yAxis: {
        type: 'category',
        boundaryGap: false,
        data: yLabels,
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
          // areaStyle: {
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     {
          //       offset: 0,
          //       color: 'rgb(255, 158, 68)',
          //     },
          //     {
          //       offset: 1,
          //       color: 'rgb(255, 70, 131)',
          //     },
          //   ]),
          // },
          data,
        },
      ],
    };
  }, [data, yLabels]);

  return (
    <Box
      sx={{
        width: '20em',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        borderLeft: '2px solid #444',
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
