import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

interface IUiStore {
  filename: string;
  ascanHidden: boolean;
  fftMode: boolean;
  activeTab: 'sizes' | 'processing' | 'spectrum' | 'visual';

  setFilename: (filename: string) => void;
  setAscanHidden: (hidden: boolean) => void;
  setFftMode: (mode: boolean) => void;
  setActiveTab: (tab: 'sizes' | 'processing' | 'spectrum' | 'visual') => void;
}

const useUiStoreBase = create<IUiStore>((set) => ({
  filename: 'Dowser',
  ascanHidden: false,
  fftMode: false,
  activeTab: 'sizes',

  setFilename: (filename: string) => set(() => ({ filename })),
  setAscanHidden: (hidden: boolean) => set(() => ({ ascanHidden: hidden })),
  setFftMode: (mode: boolean) => set(() => ({ fftMode: mode })),
  setActiveTab: (tab: 'sizes' | 'processing' | 'spectrum' | 'visual') =>
    set(() => ({ activeTab: tab })),
}));

const useUiStore = createSelectors(useUiStoreBase);

export default useUiStore;
