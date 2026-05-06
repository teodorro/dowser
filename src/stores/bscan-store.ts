import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';
import type { Optional } from '../types/utility-types';

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
  indexAscan: Optional<number>;
  indexT: Optional<number>;
  valueRange: Optional<{
    min: number;
    max: number;
  }>;

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
  setIndexAscan: (ind: Optional<number>) => void;
  setIndexT: (ind: Optional<number>) => void;
  setValueRange: (range: Optional<{ min: number; max: number }>) => void;
}

const useBscanStoreBase = create<IBscanStore>((set) => ({
  bscan: [],
  bscanToShow: [],
  bscanFullAmp: [],
  bscanFft: [],
  d: 1,
  dx: 0.1,
  dt: 1,
  eps: 9,
  velocity: 0.1,
  selectedYAxis: 'time',
  indexAscan: undefined,
  indexT: undefined,
  valueRange: undefined,

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
  setValueRange: (range) => set(() => ({ valueRange: range })),
}));

const useBscanStore = createSelectors(useBscanStoreBase);

export default useBscanStore;
