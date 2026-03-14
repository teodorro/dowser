export type FrequenciesWindow = number[];

export const AttributesModeType = {
  PeakFrequencies: 'peakFrequencies',
  SpectrumWidths: 'spectrumWidths',
  QualityFactors: 'qualityFactors',
  Coherence: 'coherence',
} as const;

export type AttributesModeType =
  (typeof AttributesModeType)[keyof typeof AttributesModeType];
