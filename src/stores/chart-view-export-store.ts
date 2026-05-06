import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

export type ChartViewExportFn = () => void | Promise<void>;

interface ChartViewExportStore {
  exportHandler: ChartViewExportFn | null;
  setChartViewExportHandler: (handler: ChartViewExportFn | null) => void;
  runChartViewExport: () => Promise<void>;
}

const useChartViewExportStoreBase = create<ChartViewExportStore>(
  (set, get) => ({
    exportHandler: null,
    setChartViewExportHandler: (handler) => set({ exportHandler: handler }),
    runChartViewExport: async () => {
      const fn = get().exportHandler;
      if (fn) await fn();
    },
  }),
);

const useChartViewExportStore = createSelectors(useChartViewExportStoreBase);

export default useChartViewExportStore;
