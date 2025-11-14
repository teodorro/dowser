import React, { useEffect, useMemo, useRef, useState } from 'react';
import useBscanStore from './stores/bscan-store';
import { Box } from '@mui/material';
import * as d3 from 'd3';

const transpose = <T,>(m: T[][]): T[][] =>
  m.length
    ? Array.from({ length: m[0].length }, (_, c) => m.map((r) => r[c]))
    : [];
type Cell = { x: number; y: number; v: number; sx: number; sy: number };

export default function Bscand3({ rotated = false }: { rotated?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgD3Ref =
    useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>(null);

  const bscan = useBscanStore((s) => s.bscan);
  const dx = useBscanStore((s) => s.dx);
  const dt = useBscanStore((s) => s.dt);

  const maxCells = 200_000;

  const z = useMemo(
    () => (rotated ? transpose(bscan) : bscan),
    [bscan, rotated]
  );

  const rows = z.length || 0;
  const cols = rows ? z[0].length : 0;

  const chartMargin = { top: 6, right: 2, bottom: 6, left: 2 };

  const [size, setSize] = useState({ width: 0, height: 0 });

  const getChartWidth = (): number =>
    Math.max(0, size.width - chartMargin.left - chartMargin.right);
  const getChartHeight = (): number =>
    Math.max(0, size.height - chartMargin.top - chartMargin.bottom);

  // const domain = useMemo<[number, number]>(() => {
  //   if (!rows || !cols) return [0, 1];
  //   const flat = new Float64Array(rows * cols);
  //   let k = 0;
  //   for (let y = 0; y < rows; y++)
  //     for (let x = 0; x < cols; x++) flat[k++] = z[y][x];
  //   const sorted = Array.from(flat).sort((a, b) => a - b);
  //   const q1 = d3.quantileSorted(sorted, 0.01) ?? 0;
  //   const q9 = d3.quantileSorted(sorted, 0.99) ?? 1;
  //   const m = Math.max(Math.abs(q1), Math.abs(q9));
  //   return [-m, m || 1];
  // }, [z, rows, cols]);
  const domain = useMemo<[number, number]>(() => {
    const minmaxes = bscan.map((ascan) => ({
      min: Math.min(...ascan),
      max: Math.max(...ascan),
    }));
    const min = Math.min(...minmaxes.map((m) => m.min));
    const max = Math.max(...minmaxes.map((m) => m.max));
    return [min, max];
  }, [z, bscan]);

  const { cells, strideX, strideY } = useMemo(() => {
    if (!rows || !cols) return { cells: [] as Cell[], strideX: 1, strideY: 1 };
    const total = rows * cols;
    const ratio = total > maxCells ? Math.sqrt(total / maxCells) : 1;
    const stride = Math.max(1, Math.floor(ratio)); // same stride both axes for simplicity
    const out: Cell[] = [];
    for (let y = 0; y < rows; y += stride) {
      const yy = Math.min(y, rows - 1);
      for (let x = 0; x < cols; x += stride) {
        const xx = Math.min(x, cols - 1);
        out.push({ x: xx, y: yy, v: z[yy][xx], sx: stride, sy: stride });
      }
    }
    return { cells: out, strideX: stride, strideY: stride };
  }, [z, rows, cols, maxCells]);

  const color = useMemo(
    () => d3.scaleSequential(d3.interpolateTurbo).domain(domain),
    [domain]
  );

  // ResizeObserver to track container size
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!size.width || !size.height) return;
    const chartWidth = getChartWidth();
    const chartHeight = getChartHeight();
    initSvg(chartWidth, chartHeight);
    if (svgD3Ref.current == null) return;

    const innerChart = getInnerChart(
      svgD3Ref.current,
      chartMargin.left,
      chartMargin.top
    );

    const gRoot = innerChart
      .append('g')
      .attr('transform', `translate(${chartMargin.left},${chartMargin.top})`);
    const gHeat = gRoot.append('g').attr('class', 'heat');

    const xData = d3.scaleLinear().domain([0, cols]).range([0, chartWidth]);
    const yData = d3.scaleLinear().domain([0, rows]).range([0, chartHeight]);

    const bw = xData(strideX) - xData(0);
    const bh = yData(strideY) - yData(0);

    gHeat
      .selectAll('rect')
      .data(cells)
      .join('rect')
      .attr('x', (d) => xData(d.x))
      .attr('y', (d) => yData(d.y))
      .attr('width', bw)
      .attr('height', bh)
      .attr('fill', (d) => color(d.v))
      .attr('shape-rendering', 'crispEdges')
      .attr('pointer-events', 'none');
  }, [size, svgD3Ref, bscan]);

  const initSvg = (width: number, height: number) => {
    if (!containerRef.current) return;
    if (svgD3Ref.current) {
      svgD3Ref.current.attr('width', width).attr('height', height);
    } else {
      svgD3Ref.current = d3
        .select(containerRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('max-width', '100%')
        .style('max-height', '100%')
        .style('overflow', 'visible');
    }
  };

  const getInnerChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    marginLeft: number,
    marginTop: number
  ): d3.Selection<d3.BaseType | SVGGElement, null, SVGSVGElement, unknown> =>
    svg
      .selectAll('.inner-chart')
      .data([null])
      .join('g')
      .attr('class', 'inner-chart')
      .attr('transform', `translate(${marginLeft}, ${marginTop})`);

  const addSmth = (
    innerChart: d3.Selection<
      d3.BaseType | SVGGElement,
      null,
      SVGSVGElement,
      unknown
    >,
    contours: d3.Contours,
    path: d3.GeoPath,
    color: any,
    data: number[]
  ) => {
    innerChart
      .append('g')
      .attr('stroke', 'black')
      .selectAll()
      .data(color.ticks(20))
      .join('path')
      .attr('d', (d) => path(contours.contour(data, d)))
      .attr('fill', color);
  };

  return (
    // <Box sx={{ border: '2px solid #a00' }}>
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '500px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'var(--theme-background-color)',
      }}
    ></div>
    // </Box>
  );
}
