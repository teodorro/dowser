import { convertInd2Amp } from './convert-ind-2-amp';

export const readKrotTxtFile = (raw: string): number[][] => {
  const lines = raw.replace(/\r\n?/g, '\n').replace(/\r\n?/g, '\n').split('\n');
  const cells = lines.slice(1, lines.length - 1).map((line) => {
    const elements = line.split(';');
    return {
      n: Number.parseInt(elements[0]),
      t: Number.parseInt(elements[1]),
      a: Number.parseInt(elements[2]),
    };
  });
  const notZeroCells = removeEmptyAscans(cells);
  const data: number[][] = [];
  notZeroCells.forEach((cell) => {
    if (data.length === cell.n) data.push([]);
    data[cell.n][cell.t] = cell.a;
  });
  const x = data.flat();
  const y = new Set(x);
  const z = [...y].sort((a, b) => a - b);
  const maxValue = Math.max(...data.map((x) => Math.max(...x)));
  const minValue = Math.min(...data.map((x) => Math.min(...x)));

  if (maxValue < 130 && minValue >= 0) {
    convertIndicesToAmplitudes(data);
  } else if (maxValue < 260 && minValue >= 0) {
    getRidOfTwoStepKrotFormat(data);
    convertIndicesToAmplitudes(data);
  } else if (maxValue > 150000 && minValue >= 0) {
    setZero150000(data);
  }

  return data;
};

const setZero150000 = (data: number[][]) => {
  data.forEach((ascan) => {
    for (let i = 0; i < ascan.length; i++) {
      ascan[i] = ascan[i] - 88991;
    }
  });
};

const convertIndicesToAmplitudes = (bscan: number[][]) => {
  bscan.forEach((ascan) => {
    for (let i = 0; i < ascan.length; i++) {
      ascan[i] = convertInd2Amp(ascan[i]);
    }
  });
};

const getRidOfTwoStepKrotFormat = (bscan: number[][]) => {
  bscan.forEach((ascan) => {
    for (let i = 0; i < ascan.length; i++) {
      ascan[i] = Math.max(Math.round(ascan[i] / 2 - 1), 0);
    }
  });
};

export const removeEmptyAscans = (
  cells: { n: number; t: number; a: number }[]
): { n: number; t: number; a: number }[] => {
  const ns = [...new Set(cells.map((cell) => cell.n))];
  const nsSums = ns
    .map((n) => ({
      n: n,
      sum: cells
        .filter((cell) => cell.n === n)
        .reduce((ac, x) => {
          return ac + x.a;
        }, 0),
    }))
    .filter((x) => x.sum > 0);
  const notZeroCells = cells.filter((cell) =>
    nsSums.some((ns) => ns.n === cell.n)
  );
  return notZeroCells;
};
