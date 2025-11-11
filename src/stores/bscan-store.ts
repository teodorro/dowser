import { create } from 'zustand';

interface IBscanStore {
  bscan: number[][];
  d: number;
  dx: number;
  dt: number;

  setBscan: (dtoBscan: number[][]) => void;
  setD: (dtoD: number) => void;
  setDx: (dtoDx: number) => void;
  setDt: (dtoDt: number) => void;
}

const useBscanStore = create<IBscanStore>((set) => ({
  bscan: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],
  d: 1,
  dx: 0.1,
  dt: 1,

  setBscan: (dtoBscan) => set(() => ({ bscan: dtoBscan })),
  setD: (dtoD) => set(() => ({ d: dtoD })),
  setDx: (dtoDx) => set(() => ({ dx: dtoDx })),
  setDt: (dtoDt) => set(() => ({ dt: dtoDt })),
}));

export default useBscanStore;
