import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

interface IBscanStore {
  bscan: number[][];
  bscanToShow: number[][];
  bscanFullAmp: number[][];
  bscanFft: number[][];
  d: number;
  dx: number;
  dt: number;
  eps: number;
  velocity: number;
  selectedYAxis: string;
  indexAscan: number | undefined;
  indexT: number | undefined;

  setBscan: (dtoBscan: number[][]) => void;
  setBscanToShow: (dtoBscan: number[][]) => void;
  setBscanFullAmp: (dtoBscan: number[][]) => void;
  setBscanFft: (dtoBscan: number[][]) => void;
  setD: (dtoD: number) => void;
  setDx: (dtoDx: number) => void;
  setDt: (dtoDt: number) => void;
  setEps: (e: number) => void;
  setVelocity: (v: number) => void;
  setSelectedYAxis: (axis: string) => void;
  setIndexAscan: (ind: number | undefined) => void;
  setIndexT: (ind: number | undefined) => void;
}

const useBscanStoreBase = create<IBscanStore>((set) => ({
  bscan: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],
  bscanToShow: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],
  bscanFullAmp: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],
  bscanFft: [
    [1, 20, 30],
    [20, 1, 60],
    [30, 60, 1],
  ],
  d: 1,
  dx: 0.1,
  dt: 1,
  eps: 9,
  velocity: 0.1,
  selectedYAxis: 'time',
  indexAscan: undefined,
  indexT: undefined,

  setBscan: (dtoBscan) => set(() => ({ bscan: dtoBscan })),
  setBscanToShow: (dtoBscan) => set(() => ({ bscanToShow: dtoBscan })),
  setBscanFullAmp: (dtoBscan) => set(() => ({ bscanFullAmp: dtoBscan })),
  setBscanFft: (dtoBscan) => set(() => ({ bscanFft: dtoBscan })),
  setD: (dtoD) => set(() => ({ d: dtoD })),
  setDx: (dtoDx) => set(() => ({ dx: dtoDx })),
  setDt: (dtoDt) => set(() => ({ dt: dtoDt })),
  setEps: (e) => set(() => ({ eps: e })),
  setVelocity: (v) => set(() => ({ velocity: v })),
  setSelectedYAxis: (axis) => set(() => ({ selectedYAxis: axis })),
  setIndexAscan: (ind) => set(() => ({ indexAscan: ind })),
  setIndexT: (ind) => set(() => ({ indexT: ind })),
}));

const useBscanStore = createSelectors(useBscanStoreBase);

export default useBscanStore;
