import savitzkyGolay from 'ml-savitzky-golay';

export const savGolFilter = (
  data: number[][],
  direction: 'horizontal' | 'vertical' = 'vertical',
  options?: { h?: number; windowSize?: number; polynomial?: number },
): number[][] => {
  if (direction === 'vertical') return verticalSavGolFilter(data, options);
  else return horizontalSavGolFilter(data, options);
};

const verticalSavGolFilter = (
  data: number[][],
  options?: { h?: number; windowSize?: number; polynomial?: number },
): number[][] => {
  const windowSize = options?.windowSize ?? 11;
  const polynomial = options?.polynomial ?? 3;
  const h = options?.h ?? 1;
  const processedData: number[][] = data.map((ascan) => {
    const smoothedAscan = savitzkyGolay(ascan, h, {
      derivative: 0,
      windowSize,
      polynomial,
      pad: 'pre',
      padValue: 'replicate',
    });
    return smoothedAscan;
  });
  return processedData;
};

const horizontalSavGolFilter = (
  data: number[][],
  options?: { h?: number; windowSize?: number; polynomial?: number },
): number[][] => {
  const windowSize = options?.windowSize ?? 11;
  const polynomial = options?.polynomial ?? 3;
  const h = options?.h ?? 1;

  const rotatedData = data[0].map((_, colIndex) =>
    data.map((row) => row[colIndex]),
  );

  const processedRotatedData: number[][] = rotatedData.map((row) => {
    const smoothedRow = savitzkyGolay(row, h, {
      derivative: 0,
      windowSize,
      polynomial,
      pad: 'pre',
      padValue: 'replicate',
    });
    return smoothedRow;
  });

  const processedData = processedRotatedData[0].map((_, colIndex) =>
    processedRotatedData.map((row) => row[colIndex]),
  );

  return processedData;
};
