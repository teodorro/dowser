import { fftFreqAxisHalf } from '../../processing/data-processing/fft-bscan';
import type { FrequenciesWindow } from '../../types/attributes-types';

export const getQualityFactors = (
  frequencies: FrequenciesWindow[][],
  dt: number,
): number[][] => {
  const windowLength = frequencies[0][0].length;
  const axis = fftFreqAxisHalf(windowLength, dt);
  const qualityFactors = frequencies.map((ascan) => {
    const qualityFactorsAscan = [];
    for (let i = 0; i < ascan.length - 2; i++) {
      const window1 = ascan[i];
      const window2 = ascan[i + 1];
      let fc1p1 = 0;
      let fc1p2 = 0;
      let fc2p1 = 0;
      let fc2p2 = 0;
      for (let j = 0; j < window1.length; j++) {
        fc1p1 += window1[j] * axis[j];
        fc1p2 += window1[j];
        fc2p1 += window2[j] * axis[j];
        fc2p2 += window2[j];
      }
      const fc1 = fc1p2 !== 0 ? fc1p1 / fc1p2 : 0;
      const fc2 = fc2p2 !== 0 ? fc2p1 / fc2p2 : 0;
      const qualityFactor =
        fc1 !== fc2 && fc1 !== 0 && fc2 !== 0
          ? (Math.log(fc1 / fc2) / Math.PI) * dt * (fc1 - fc2)
          : 0;
      qualityFactorsAscan.push(qualityFactor);
    }
    return qualityFactorsAscan;
  });
  return qualityFactors;
};

export default getQualityFactors;
