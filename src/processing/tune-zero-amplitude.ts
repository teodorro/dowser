export const tuneZeroAmplitude = (data: number[][]): number[][] => {
  let processedData: number[][] = [];
  const min = Math.min(...data.map((x) => Math.min(...x)));
  if (min < 0) return data;
  const max = Math.max(...data.map((x) => Math.max(...x)));
  if (max < 128) {
    processedData = convert128(data);
  } else if (max < 256) {
    processedData = convert256(data);
  } else if (max < 6000) {
    processedData = convert6000(data);
  } else if (max < 180000) {
    processedData = convert180000(data);
  } else throw new Error('Обработка формата файла не реализована');
  return processedData;
};

const convert128 = (data: number[][]): number[][] => {
  const zeroAmp = 64;
  data.forEach((ascan) =>
    ascan.forEach((val, ind) => {
      ascan[ind] = val - zeroAmp;
    })
  );
  return data;
};

const convert256 = (data: number[][]): number[][] => {
  const zeroAmp = 128;
  data.forEach((ascan) =>
    ascan.forEach((val, ind) => {
      ascan[ind] = val - zeroAmp;
    })
  );
  return data;
};

const convert6000 = (data: number[][]): number[][] => {
  const zeroAmp = 2515;
  data.forEach((ascan) =>
    ascan.forEach((val, ind) => {
      ascan[ind] = val - zeroAmp;
    })
  );
  return data;
};

const convert180000 = (data: number[][]): number[][] => {
  const zeroAmp = 88989;
  data.forEach((ascan) =>
    ascan.forEach((val, ind) => {
      ascan[ind] = val - zeroAmp;
    })
  );
  return data;
};
