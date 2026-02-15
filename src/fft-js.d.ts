/**
 * Type declarations for the untyped npm package "fft-js".
 * There is no @types/fft-js on npm, so we declare the module locally.
 */

declare module 'fft-js' {
  /** Complex number as [real, imaginary] */
  export type ComplexPair = [number, number];

  /** FFT of a real vector; returns half-spectrum complex bins. */
  export function fft(vector: number[]): ComplexPair[];

  /** In-place FFT (mutates the input vector). */
  export function fftInPlace(vector: number[]): void;

  /** Inverse FFT of complex bins. */
  export function ifft(vector: ComplexPair[]): ComplexPair[];

  export const util: {
    /** Magnitude for each FFT bin (first half of spectrum). */
    fftMag(fftBins: ComplexPair[]): number[];
    /** Frequency in Hz for each bin given sample rate. */
    fftFreq(fftBins: ComplexPair[], sampleRate: number): number[];
    exponent(k: number, N: number): ComplexPair;
  };

  export const dft: { dft: (vector: number[]) => ComplexPair[] };
  export const idft: { idft: (vector: ComplexPair[]) => ComplexPair[] };
}
