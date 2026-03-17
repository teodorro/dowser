import { fftFreqAxisHalf } from '../../processing/data-processing/fft-bscan';
import type { FrequenciesWindow } from '../../types/attributes-types';

export const getSpectrumWidths = (
  frequencies: FrequenciesWindow[][],
  dt: number,
): number[][] => {
  const windowLength = frequencies[0][0].length;
  const axis = fftFreqAxisHalf(windowLength, dt);
  const freqMean = axis.reduce((acc, curr) => acc + curr, 0) / axis.length;
  const widths = frequencies.map((ascan) => {
    return ascan.map((window) => {
      let widthUpper = 0;
      let widthLower = 0;
      for (let i = 0; i < window.length; i++) {
        widthUpper += (axis[i] - freqMean) ** 2 * window[i] ** 2;
        widthLower += window[i] ** 2;
      }
      const width = Math.sqrt(widthUpper / widthLower);
      return width;
    });
  });
  return widths;
};

export default getSpectrumWidths;
