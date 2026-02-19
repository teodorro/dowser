export const dewow = (data: number[][], windowSize: number): number[][] => {
  if (windowSize < 3) {
    throw new Error('Window size must be not less than 3');
  }
  return data.map((ascan) => dewowAscan(ascan, windowSize));
};

export const dewowAscan = (ascan: number[], windowSize: number): number[] => {
  let W = Math.max(3, Math.floor(windowSize));
  if (W % 2 === 0) W += 1; // make it odd
  const half = Math.floor(W / 2);

  const n = ascan.length;
  if (n === 0) return [];

  // Prefix sums for fast window means
  const ps = new Array<number>(n + 1);
  ps[0] = 0;
  for (let i = 0; i < n; i++) ps[i + 1] = ps[i] + ascan[i];

  const dewowed = new Array<number>(n);

  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - half);
    const b = Math.min(n - 1, i + half);
    const sum = ps[b + 1] - ps[a];
    const mean = sum / (b - a + 1);
    dewowed[i] = ascan[i] - mean;
  }
  return dewowed;
};

export default dewow;
