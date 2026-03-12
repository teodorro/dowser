import { fft, ifft, util } from 'fft-js';

type ComplexPair = [number, number];

const EPS = 1e-9;

export const getFftBscan = (
  data: number[][],
): { bscan: number[][]; complexBins: ComplexPair[][] } => {
  const fftBscan: number[][] = [];
  const bins: ComplexPair[][] = [];
  for (let i = 0; i < data.length; i++) {
    const complexBins = fft(data[i]) as ComplexPair[];
    const magnitudes = util.fftMag(complexBins);
    fftBscan.push(magnitudes);
    bins.push(complexBins);
  }
  return { bscan: fftBscan, complexBins: bins };
};

export const getIfftBscan = (data: ComplexPair[][]): number[][] => {
  return data.map(ifftToReal);
};

export function ifftToReal(traceBins: ComplexPair[]): number[] {
  const y = ifft(traceBins) as ComplexPair[];

  const out = new Array<number>(y.length);
  for (let i = 0; i < y.length; i++) {
    const [re, im] = y[i];
    if (Math.abs(im) > EPS) {
      console.warn(
        `IFFT returned non-negligible imaginary part at ${i}: ${im}`,
      );
    }
    out[i] = re;
  }
  return out;
}

export const fftFreqAxisHalf = (N: number, dt: number): number[] => {
  const fs = ((1 / dt) * 1000) / 2; // MHz
  const half = Math.floor(N);
  const df = fs / N;
  return Array.from({ length: half }, (_, k) => k * df);
};
