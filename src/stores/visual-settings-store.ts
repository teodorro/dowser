import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

interface IVisualSettingsStore {
  logAmplitudeSelected: boolean;
  logAmplitudeSelected2: boolean;
  selectedPalette: string;

  setLogAmplitudeSelected: (selected: boolean) => void;
  setLogAmplitudeSelected2: (selected: boolean) => void;
  setSelectedPalette: (palette: string) => void;
}

const useVisualSettingsStoreBase = create<IVisualSettingsStore>((set) => ({
  logAmplitudeSelected: true,
  logAmplitudeSelected2: false,
  selectedPalette: 'greys',

  setLogAmplitudeSelected: (selected: boolean) =>
    set(() => ({ logAmplitudeSelected: selected })),
  setLogAmplitudeSelected2: (selected: boolean) =>
    set(() => ({ logAmplitudeSelected2: selected })),
  setSelectedPalette: (palette: string) =>
    set(() => ({ selectedPalette: palette })),
}));

const useVisualSettingsStore = createSelectors(useVisualSettingsStoreBase);

export default useVisualSettingsStore;
