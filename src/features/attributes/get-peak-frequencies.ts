import type { FrequenciesWindow } from '../../types/attributes-types';

export const getPeakFrequencies = (
  frequencies: FrequenciesWindow[][],
): number[][] => {
  const peakFrequencies = frequencies.map((window) => {
    return window.map((frequency) => {
      return (
        frequency.reduce((acc, curr) => Math.max(curr, acc), 0) /
        frequency.length
      );
    });
  });
  return peakFrequencies;
};

export default getPeakFrequencies;
