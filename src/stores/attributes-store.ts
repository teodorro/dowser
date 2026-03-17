import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';
import {
  AttributesModeType,
  type FrequenciesWindow,
} from '../types/attributes-types';

interface IAttributesStore {
  windowSize: number;
  selectedAttribute: AttributesModeType;
  frequencies: FrequenciesWindow[][];
  peakFrequencies: number[][];
  spectrumWidths: number[][];
  qualityFactors: number[][];
  coherence: number[][];
  scanToShow: number[][];

  setWindowSize: (size: number) => void;
  setSelectedAttribute: (attribute: AttributesModeType) => void;
  setFrequencies: (frequencies: FrequenciesWindow[][]) => void;
  setPeakFrequencies: (peakFrequencies: number[][]) => void;
  setSpectrumWidths: (spectrumWidths: number[][]) => void;
  setQualityFactors: (qualityFactors: number[][]) => void;
  setCoherence: (coherence: number[][]) => void;
  setScanToShow: (scanToShow: number[][]) => void;
}

const useAttributesStoreBase = create<IAttributesStore>((set) => ({
  windowSize: 16,
  selectedAttribute: AttributesModeType.PeakFrequencies,
  frequencies: [],
  peakFrequencies: [],
  spectrumWidths: [],
  qualityFactors: [],
  coherence: [],
  scanToShow: [],

  setWindowSize: (size: number) => set({ windowSize: size }),
  setSelectedAttribute: (attribute: AttributesModeType) =>
    set({ selectedAttribute: attribute }),
  setFrequencies: (frequencies: FrequenciesWindow[][]) => set({ frequencies }),
  setPeakFrequencies: (peakFrequencies: number[][]) => set({ peakFrequencies }),
  setSpectrumWidths: (spectrumWidths: number[][]) => set({ spectrumWidths }),
  setQualityFactors: (qualityFactors: number[][]) => set({ qualityFactors }),
  setCoherence: (coherence: number[][]) => set({ coherence }),
  setScanToShow: (scanToShow: number[][]) => set({ scanToShow }),
}));

const useAttributesStore = createSelectors(useAttributesStoreBase);

export default useAttributesStore;
