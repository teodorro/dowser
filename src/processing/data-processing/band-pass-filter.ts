import { fft, ifft } from 'fft-js';

type ComplexPair = [number, number];

const EPS = 1e-8;

export const bandPassFilter = (
  data: number[][],
  lp: { stopHz: number; passHz: number },
  hp: { passHz: number; stopHz: number },
  dt: number,
): number[][] => {
  const res: number[][] = [];
  for (let i = 0; i < data.length; i++) {
    const ascan = data[i];
    const spectrum = fft(ascan);
    const freqs = fftFreqAxisHalfAndNyquist(ascan.length, dt);
    const lpMask = lowPass(freqs, lp.passHz, lp.stopHz);
    const hpMask = highPass(freqs, hp.stopHz, hp.passHz);

    const oneSided = lpMask.map((v, i) => v * hpMask[i]);
    const fullMask = mirrorMaskToFull(oneSided, ascan.length);
    const updatedSpectrum = applyMask(spectrum, fullMask);
    const ifftRes = ifft(updatedSpectrum);
    const updatedAscan = ifftToReal(ifftRes);
    res.push(updatedAscan);
  }
  return res;
};

const lowPass = (freqs: number[], passHz: number, stopHz: number) => {
  return freqs.map((f) => {
    if (f <= passHz) return 1;
    if (f >= stopHz) return 0;
    const x = (f - passHz) / (stopHz - passHz); // 0..1
    return 0.5 * (1 + Math.cos(Math.PI * x)); // 1..0
  });
};

const highPass = (freqs: number[], passHz: number, stopHz: number) => {
  // if (!(stopHz < passHz)) throw new Error('highpass: stopHz must be < passHz');
  return freqs.map((f) => {
    if (f <= stopHz) return 0;
    if (f >= passHz) return 1;
    const x = (f - stopHz) / (passHz - stopHz); // 0..1
    return 0.5 * (1 - Math.cos(Math.PI * x)); // 0..1
  });
};

const mirrorMaskToFull = (oneSided: number[], N: number): number[] => {
  const fullMask = new Array<number>(N).fill(0);
  const half = Math.floor(N / 2);

  //DC
  fullMask[0] = oneSided[0];

  //Positive frequencies
  for (let i = 1; i < half; i++) {
    fullMask[i] = oneSided[i];
    fullMask[N - i] = oneSided[i];
  }

  // Nyquist (only meaningful when N even)
  if (N % 2 === 0) {
    fullMask[half] = oneSided[half];
  }

  return fullMask;
};

const applyMask = (spectrum: ComplexPair[], mask: number[]): ComplexPair[] => {
  return spectrum.map(([re, im], i) => [re * mask[i], im * mask[i]]);
};

const ifftToReal = (Y: ComplexPair[]): number[] => {
  const out = new Array<number>(Y.length);
  for (let i = 0; i < Y.length; i++) {
    const [re, im] = Y[i];
    if (Math.abs(im) > EPS) {
      console.warn(
        `IFFT returned non-negligible imaginary part at ${i}: ${im}`,
      );
    }
    out[i] = re;
  }
  return out;
};

export const fftFreqAxisHalfAndNyquist = (N: number, dt: number): number[] => {
  const fs = (1 / dt) * 1000; // MHz
  const half = Math.floor(N);
  const df = fs / N;
  return Array.from({ length: half + 1 }, (_, k) => k * df);
};
