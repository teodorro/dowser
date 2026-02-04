import { create } from "zustand";
import { createSelectors } from "../utils/create-selectors";
import { logAmplitude } from "../processing/visual-processing/log-amplitude";

interface IDataProcessorStore {
  logAmplitudeSelected: boolean;
  operations: ((ops: number[][]) => number[][])[];

  setLogAmplitudeSelected: (selected: boolean) => void;
  setOperations: (ops: ((oo: number[][]) => number[][])[]) => void;
}

const useDataProcessorStoreBase = create<IDataProcessorStore>((set) => ({
  logAmplitudeSelected: true,
  operations: [logAmplitude],

  setLogAmplitudeSelected: (selected: boolean) =>
    set(() => ({ logAmplitudeSelected: selected })),
  setOperations: (ops: ((oo: number[][]) => number[][])[]) => {
    set(() => ({
      operations: ops,
    }));
  },
}));

const useDataProcessorStore = createSelectors(useDataProcessorStoreBase);

export default useDataProcessorStore;
