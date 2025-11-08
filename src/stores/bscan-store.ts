import { create } from 'zustand';

interface IBscanStore {
  bscan: number[][];

  setBscan: (dtoBscan: number[][]) => void;
}

const useBscanStore = create<IBscanStore>((set) => ({
  bscan: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],

  setBscan: (dtoBscan) => set(() => ({ bscan: dtoBscan })),
}));

export default useBscanStore;
