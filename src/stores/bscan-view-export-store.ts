import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

export type BscanViewExportFn = () => void | Promise<void>;

interface BscanViewExportStore {
  exportHandler: BscanViewExportFn | null;
  setBscanViewExportHandler: (handler: BscanViewExportFn | null) => void;
  runBscanViewExport: () => Promise<void>;
}

const useBscanViewExportStoreBase = create<BscanViewExportStore>((set, get) => ({
  exportHandler: null,
  setBscanViewExportHandler: (handler) => set({ exportHandler: handler }),
  runBscanViewExport: async () => {
    const fn = get().exportHandler;
    if (fn) await fn();
  },
}));

const useBscanViewExportStore = createSelectors(useBscanViewExportStoreBase);

export default useBscanViewExportStore;
