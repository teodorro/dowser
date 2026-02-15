import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

interface IUiStore {
  filename: string;
  ascanHidden: boolean;
  fftMode: boolean;

  setFilename: (filename: string) => void;
  setAscanHidden: (hidden: boolean) => void;
  setFftMode: (mode: boolean) => void;
}

const useUiStoreBase = create<IUiStore>((set) => ({
  filename: 'Dowser',
  ascanHidden: false,
  fftMode: false,

  setFilename: (filename: string) => set(() => ({ filename })),
  setAscanHidden: (hidden: boolean) => set(() => ({ ascanHidden: hidden })),
  setFftMode: (mode: boolean) => set(() => ({ fftMode: mode })),
}));

const useUiStore = createSelectors(useUiStoreBase);

export default useUiStore;
