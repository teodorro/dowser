import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';
import TabType from '../types/tab-type';
import type { ViewType } from '../types/view-type';

interface IUiStore {
  filename: string;
  ascanHidden: boolean;
  viewMode: ViewType;
  activeTab: TabType;
  isLoading: boolean;

  setFilename: (filename: string) => void;
  setAscanHidden: (hidden: boolean) => void;
  setViewMode: (type: ViewType) => void;
  setActiveTab: (tab: TabType) => void;
  setIsLoading: (loading: boolean) => void;
}

const useUiStoreBase = create<IUiStore>((set) => ({
  filename: 'Dowser',
  ascanHidden: true,
  viewMode: { type: 'bscan' },
  activeTab: TabType.SIZES,
  isLoading: false,

  setFilename: (filename: string) => set(() => ({ filename })),
  setAscanHidden: (hidden: boolean) => set(() => ({ ascanHidden: hidden })),
  setViewMode: (type: ViewType) => set(() => ({ viewMode: type })),
  setActiveTab: (tab: TabType) => set(() => ({ activeTab: tab as TabType })),
  setIsLoading: (loading: boolean) => set(() => ({ isLoading: loading })),
}));

const useUiStore = createSelectors(useUiStoreBase);

export default useUiStore;
