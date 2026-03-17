import { fftFreqAxisHalf } from '../../processing/data-processing/fft-bscan';
import type { FrequenciesWindow } from '../../types/attributes-types';

export const getPeakFrequencies = (
  frequencies: FrequenciesWindow[][],
  dt: number,
): number[][] => {
  const windowLength = frequencies[0][0].length;
  const axis = fftFreqAxisHalf(windowLength, dt);
  const peakFrequencies = frequencies.map((ascan) => {
    return ascan.map((window) => {
      const peakAmplitude = window.reduce(
        (acc, curr) => Math.max(curr, acc),
        0,
      );
      const peakIndex = window.indexOf(peakAmplitude);
      const peakFrequency = axis[peakIndex];
      return peakFrequency;
    });
  });
  return peakFrequencies;
};

export default getPeakFrequencies;
