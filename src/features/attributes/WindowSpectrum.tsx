import * as echarts from 'echarts';
import { useEffect, useMemo, useRef, useState } from 'react';
import useBscanStore from '../../stores/bscan-store';
import useAttributesStore from '../../stores/attributes-store';
import { fftFreqAxisHalf } from '../../processing/data-processing/fft-bscan';
import { Typography } from '@mui/material';

export default function WindowSpectrum() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartRefInstance = useRef<ReturnType<typeof echarts.init> | null>(null);

  const indexAscan = useBscanStore.use.indexAscan();
  const indexT = useBscanStore.use.indexT();
  const dt = useBscanStore.use.dt();

  const frequencies = useAttributesStore.use.frequencies();

  const freqAxis = useMemo(() => {
    if (frequencies == null || frequencies.length === 0) return [];
    return fftFreqAxisHalf(frequencies[0][0].length, dt).map((f) =>
      Math.round(f),
    );
  }, [frequencies, dt]);

  const [option, setOption] = useState<echarts.EChartsOption | null>({
    xAxis: {
      type: 'category',
      data: freqAxis,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data:
          indexAscan != null &&
          indexT != null &&
          frequencies != null &&
          frequencies.length > 0
            ? (frequencies[indexAscan][indexT] ?? [])
            : [],
        type: 'line',
      },
    ],
  });

  useEffect(() => {
    setOption((prev) => ({
      ...prev,
      xAxis: {
        type: 'category',
        data: freqAxis,
      },
    }));
  }, [freqAxis]);

  useEffect(() => {
    setOption((prev) => ({
      ...prev,
      series: [
        {
          data:
            indexAscan != null &&
            indexT != null &&
            frequencies != null &&
            frequencies.length > 0
              ? (frequencies[indexAscan][indexT] ?? [])
              : [],
          type: 'line',
        },
      ],
    }));
  }, [frequencies, indexAscan, indexT]);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const chart = echarts.init(el);
    chartRefInstance.current = chart;

    return () => {
      chart.dispose();
      chartRefInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (option == null) return;
    chartRefInstance.current?.setOption(option as echarts.EChartsOption);
  }, [option]);

  return (
    <>
      <Typography sx={{ mt: '1em', color: '#444', fontWeight: 'bold' }}>
        Спектр окна
      </Typography>
      <div
        ref={chartRef}
        style={{ width: '100%', height: '100%', minHeight: 240 }}
      />
    </>
  );
}
