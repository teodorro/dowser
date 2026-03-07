export const logAmplitude = (data: number[][]): number[][] => {
  const processedData: number[][] = data.map((ascan) =>
    ascan.map((x) => Math.sign(x) * Math.log(Math.abs(x) + 1)),
  );
  return processedData;
};

export default logAmplitude;
