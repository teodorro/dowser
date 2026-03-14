import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';
import { AttributesModeType } from '../types/attributes-types';
import TabType from '../types/tab-type';

interface IUiStore {
  filename: string;
  ascanHidden: boolean;
  fftMode: boolean;
  attributesMode: boolean;
  attributesModeType: AttributesModeType;
  activeTab: TabType;

  setFilename: (filename: string) => void;
  setAscanHidden: (hidden: boolean) => void;
  setFftMode: (mode: boolean) => void;
  setAttributesMode: (mode: boolean) => void;
  setAttributesModeType: (type: AttributesModeType) => void;
  setActiveTab: (tab: TabType) => void;
}

const useUiStoreBase = create<IUiStore>((set) => ({
  filename: 'Dowser',
  ascanHidden: true,
  fftMode: false,
  attributesMode: false,
  attributesModeType: AttributesModeType.PeakFrequencies,
  activeTab: TabType.SIZES,

  setFilename: (filename: string) => set(() => ({ filename })),
  setAscanHidden: (hidden: boolean) => set(() => ({ ascanHidden: hidden })),
  setFftMode: (mode: boolean) => set(() => ({ fftMode: mode })),
  setAttributesMode: (mode: boolean) => set(() => ({ attributesMode: mode })),
  setAttributesModeType: (type: AttributesModeType) =>
    set(() => ({ attributesModeType: type })),
  setActiveTab: (tab: TabType) => set(() => ({ activeTab: tab as TabType })),
}));

const useUiStore = createSelectors(useUiStoreBase);

export default useUiStore;
