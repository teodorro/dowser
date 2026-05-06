const amps = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 19, 21, 24, 27, 30, 34,
  38, 42, 48, 53, 60, 67, 75, 85, 95, 106, 119, 134, 150, 169, 189, 212, 238,
  267, 300, 337, 378, 424, 475, 533, 599, 672, 846, 1064, 1340, 1687, 2124,
  2674, 3366, 4238, 5335, 6716, 8455, 10644, 13401, 16870, 21238, 26738, 33686,
];
// 33686 artificial, just because the latest are *1.258

export const convertInd2Amp = (ind: number): number => {
  const step = ind - 63;
  let amp = Math.sign(step) * amps[Math.abs(step)];
  if (isNaN(amp)) {
    console.log('amp is NaN');
    amp = Math.sign(step) * amps[amps.length - 1];
  }
  return amp;
};
