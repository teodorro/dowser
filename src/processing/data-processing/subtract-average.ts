export const subtractAverage = (data: number[][]): number[][] => {
  const avgAscan = data
    .reduce((sum, ascan) => {
      return sum.map((val, ind) => val + ascan[ind]);
    }, new Array(data[0].length).fill(0))
    .map((sum) => sum / data.length);
  const processedData: number[][] = data.map((ascan) => {
    return ascan.map((val, ind) => val - avgAscan[ind]);
  });
  return processedData;
};

export default subtractAverage;
