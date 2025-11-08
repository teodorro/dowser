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
  const data: number[][] = [];
  cells.forEach((cell) => {
    if (data.length === cell.n) data.push([]);
    data[cell.n][cell.t] = cell.a;
  });
  return data;
};
