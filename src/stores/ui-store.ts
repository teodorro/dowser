import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';
import TabType from '../types/tab-type';

interface IUiStore {
  filename: string;
  ascanHidden: boolean;
  fftMode: boolean;
  activeTab: TabType;

  setFilename: (filename: string) => void;
  setAscanHidden: (hidden: boolean) => void;
  setFftMode: (mode: boolean) => void;
  setActiveTab: (tab: TabType) => void;
}

const useUiStoreBase = create<IUiStore>((set) => ({
  filename: 'Dowser',
  ascanHidden: false,
  fftMode: false,
  activeTab: TabType.SIZES,

  setFilename: (filename: string) => set(() => ({ filename })),
  setAscanHidden: (hidden: boolean) => set(() => ({ ascanHidden: hidden })),
  setFftMode: (mode: boolean) => set(() => ({ fftMode: mode })),
  setActiveTab: (tab: TabType) => set(() => ({ activeTab: tab as TabType })),
}));

const useUiStore = createSelectors(useUiStoreBase);

export default useUiStore;
