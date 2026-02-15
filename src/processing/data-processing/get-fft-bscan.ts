import { fft, util } from 'fft-js';

export const getFftBscan = (
  data: number[][],
): { bscan: number[][]; complexBins: [number, number][][] } => {
  const fftBscan: number[][] = [];
  const bins: [number, number][][] = [];
  for (let i = 0; i < data.length; i++) {
    const complexBins = fft(data[i]) as [number, number][];
    const magnitudes = util.fftMag(complexBins);
    fftBscan.push(magnitudes);
    bins.push(complexBins);
  }
  return { bscan: fftBscan, complexBins: bins };
};
