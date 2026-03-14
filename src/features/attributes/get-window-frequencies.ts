import * as FFT from 'fft-js';
import type { FrequenciesWindow } from '../../types/attributes-types';
const dft = (FFT as unknown as { dft: (v: number[]) => FFT.ComplexPair[] }).dft;

export const getWindowFrequencies = (
  bscan: number[][],
  windowSize: number,
): FrequenciesWindow[][] => {
  const frequencies: FrequenciesWindow[][] = [];
  const isWindowSizePowerOfTwo = isPowerOfTwo(windowSize);
  for (let i = 0; i < bscan.length; i++) {
    frequencies.push([]);
    const ascan = bscan[i];
    const half = Math.floor(windowSize / 2);
    for (let j = 0; j < ascan.length; j++) {
      const window = Array.from({ length: windowSize }, (_, i) => j - half + i)
        .map((index) => {
          if (index < 0) return 0;
          if (index >= ascan.length) return ascan.length - 1;
          return index;
        })
        .map((index) => ascan[index]);
      const complexBins = isWindowSizePowerOfTwo
        ? FFT.fft(window)
        : (dft(window) as FFT.ComplexPair[]);
      const magnitudes = FFT.util.fftMag(complexBins);
      frequencies[i].push(magnitudes);
    }
  }
  return frequencies;
};

const isPowerOfTwo = (n: number): boolean => {
  return n > 0 && (n & (n - 1)) === 0;
};

export default getWindowFrequencies;
