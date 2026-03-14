import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

interface IVisualSettingsStore {
  logAmplitudeSelected: boolean;
  logAmplitudeSelected2: boolean;
  selectedPalette: string;
  logAmplitudeSelectedSpectrum: boolean;
  selectedPaletteSpectrum: string;
  selectedPaletteAttributes: string;

  setLogAmplitudeSelected: (selected: boolean) => void;
  setLogAmplitudeSelected2: (selected: boolean) => void;
  setSelectedPalette: (palette: string) => void;
  setLogAmplitudeSelectedSpectrum: (selected: boolean) => void;
  setSelectedPaletteSpectrum: (palette: string) => void;
  setSelectedPaletteAttributes: (palette: string) => void;
}

const useVisualSettingsStoreBase = create<IVisualSettingsStore>((set) => ({
  logAmplitudeSelected: true,
  logAmplitudeSelected2: false,
  selectedPalette: 'greys',
  logAmplitudeSelectedSpectrum: false,
  selectedPaletteSpectrum: 'turbo',
  selectedPaletteAttributes: 'turbo',

  setLogAmplitudeSelected: (selected: boolean) =>
    set(() => ({ logAmplitudeSelected: selected })),
  setLogAmplitudeSelected2: (selected: boolean) =>
    set(() => ({ logAmplitudeSelected2: selected })),
  setSelectedPalette: (palette: string) =>
    set(() => ({ selectedPalette: palette })),
  setLogAmplitudeSelectedSpectrum: (selected: boolean) =>
    set(() => ({ logAmplitudeSelectedSpectrum: selected })),
  setSelectedPaletteSpectrum: (palette: string) =>
    set(() => ({ selectedPaletteSpectrum: palette })),
  setSelectedPaletteAttributes: (palette: string) =>
    set(() => ({ selectedPaletteAttributes: palette })),
}));

const useVisualSettingsStore = createSelectors(useVisualSettingsStoreBase);

export default useVisualSettingsStore;
