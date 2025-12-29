import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

interface IBscanStore {
  fullAmpBscan: number[][];
  bscan: number[][];
  d: number;
  dx: number;
  dt: number;
  eps: number;
  velocity: number;
  ascanInd: number;

  setFullAmpBscan: (dtoBscan: number[][]) => void;
  setBscan: (dtoBscan: number[][]) => void;
  setD: (dtoD: number) => void;
  setDx: (dtoDx: number) => void;
  setDt: (dtoDt: number) => void;
  setEps: (e: number) => void;
  setVelocity: (v: number) => void;
  setAscanInd: (ind: number) => void;
}

const useBscanStoreBase = create<IBscanStore>((set) => ({
  fullAmpBscan: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],
  bscan: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],
  d: 1,
  dx: 0.1,
  dt: 1,
  eps: 9,
  velocity: 0.1,
  ascanInd: 0,

  setFullAmpBscan: (dtoBscan) => set(() => ({ fullAmpBscan: dtoBscan })),
  setBscan: (dtoBscan) => set(() => ({ bscan: dtoBscan })),
  setD: (dtoD) => set(() => ({ d: dtoD })),
  setDx: (dtoDx) => set(() => ({ dx: dtoDx })),
  setDt: (dtoDt) => set(() => ({ dt: dtoDt })),
  setEps: (e) => set(() => ({ eps: e })),
  setVelocity: (v) => set(() => ({ velocity: v })),
  setAscanInd: (ind) => set(() => ({ ascanInd: ind })),
}));

const useBscanStore = createSelectors(useBscanStoreBase);

export default useBscanStore;
