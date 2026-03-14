import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';
import type { FrequenciesWindow } from '../types/attributes-types';

interface IAttributesStore {
  windowSize: number;
  frequencies: FrequenciesWindow[][];
  peakFrequencies: number[][];
  peakFrequenciesToShow: number[][];
  spectrumWidths: number[][];
  spectrumWidthsToShow: number[][];
  qualityFactors: number[][];
  qualityFactorsToShow: number[][];
  coherence: number[][];
  coherenceToShow: number[][];

  setWindowSize: (size: number) => void;
  setFrequencies: (frequencies: FrequenciesWindow[][]) => void;
  setPeakFrequencies: (peakFrequencies: number[][]) => void;
  setPeakFrequenciesToShow: (peakFrequenciesToShow: number[][]) => void;
  setSpectrumWidths: (spectrumWidths: number[][]) => void;
  setSpectrumWidthsToShow: (spectrumWidthsToShow: number[][]) => void;
  setQualityFactors: (qualityFactors: number[][]) => void;
  setQualityFactorsToShow: (qualityFactorsToShow: number[][]) => void;
  setCoherence: (coherence: number[][]) => void;
  setCoherenceToShow: (coherenceToShow: number[][]) => void;
}

const useAttributesStoreBase = create<IAttributesStore>((set) => ({
  windowSize: 16,
  frequencies: [],
  peakFrequencies: [],
  peakFrequenciesToShow: [],
  spectrumWidths: [],
  spectrumWidthsToShow: [],
  qualityFactors: [],
  qualityFactorsToShow: [],
  coherence: [],
  coherenceToShow: [],

  setWindowSize: (size: number) => set({ windowSize: size }),
  setFrequencies: (frequencies: FrequenciesWindow[][]) => set({ frequencies }),
  setPeakFrequencies: (peakFrequencies: number[][]) => set({ peakFrequencies }),
  setPeakFrequenciesToShow: (peakFrequenciesToShow: number[][]) =>
    set({ peakFrequenciesToShow }),
  setSpectrumWidths: (spectrumWidths: number[][]) => set({ spectrumWidths }),
  setSpectrumWidthsToShow: (spectrumWidthsToShow: number[][]) =>
    set({ spectrumWidthsToShow }),
  setQualityFactors: (qualityFactors: number[][]) => set({ qualityFactors }),
  setQualityFactorsToShow: (qualityFactorsToShow: number[][]) =>
    set({ qualityFactorsToShow }),
  setCoherence: (coherence: number[][]) => set({ coherence }),
  setCoherenceToShow: (coherenceToShow: number[][]) => set({ coherenceToShow }),
}));

const useAttributesStore = createSelectors(useAttributesStoreBase);

export default useAttributesStore;
