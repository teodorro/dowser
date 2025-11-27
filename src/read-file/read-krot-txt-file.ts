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
  return data;
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
