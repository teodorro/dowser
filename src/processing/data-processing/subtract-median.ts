export const subtractMedian = (data: number[][]): number[][] => {
  const rotatedSortedData = data[0].map((_, colIndex) =>
    data.map((row) => row[colIndex]).sort((a, b) => a - b),
  );
  const median = rotatedSortedData.map((row) => {
    return row[Math.floor(row.length / 2)];
  });
  const processedData: number[][] = data.map((ascan) => {
    return ascan.map((val, ind) => val - median[ind]);
  });
  return processedData;
};
