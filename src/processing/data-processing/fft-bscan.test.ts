import { getFftBscan, getIfftBscan } from './fft-bscan';
import { describe, it, expect } from 'vitest';

describe('fft-bscan', () => {
  it('should return the same bscan', () => {
    const eps = 1e-9;
    const data = [[1, 2, 3, 4, 5, 6, 7, 8]];
    const spectrum = getFftBscan(data);
    const bscan = getIfftBscan(spectrum.complexBins);

    for (let i = 0; i < bscan.length; i++) {
      for (let j = 0; j < bscan[i].length; j++) {
        expect(Math.abs(bscan[i][j]) - Math.abs(data[i][j])).lessThan(eps);
      }
    }
  });
});
